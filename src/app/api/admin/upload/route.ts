import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const isAdmin = (user.app_metadata as Record<string, unknown>)?.role === "admin";
  if (!isAdmin) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

/**
 * POST /api/admin/upload
 * Accepts a single image file via multipart/form-data and uploads it to
 * Supabase Storage using the service-role key (bypasses storage RLS).
 * Returns { url: string } on success.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not parse form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 400 });
  }

  const ext  = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `admin-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `properties/${name}`;

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Try with admin (service role) first; fall back to anon client if key missing
  let publicUrl: string | null = null;
  let uploadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("property-images")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      uploadError = error.message;
    } else {
      const { data } = admin.storage.from("property-images").getPublicUrl(path);
      publicUrl = data.publicUrl;
    }
  } catch {
    // Service role key not configured — fall back to authenticated session upload
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      uploadError = error.message;
    } else {
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      publicUrl = data.publicUrl;
    }
  }

  if (uploadError || !publicUrl) {
    return NextResponse.json(
      { error: uploadError ?? "Upload failed — check that the property-images bucket exists in Supabase Storage" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: publicUrl });
}
