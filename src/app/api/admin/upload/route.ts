import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "property-images";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const isAdmin = (user.app_metadata as Record<string, unknown>)?.role === "admin";
  if (!isAdmin) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

/** Ensure the storage bucket exists; create it as public if not. */
async function ensureBucket(admin: ReturnType<typeof createAdminClient>) {
  const { data: existing } = await admin.storage.getBucket(BUCKET);
  if (existing) return; // already exists

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  // Ignore "already exists" race condition
  if (error && !error.message.toLowerCase().includes("already exist")) {
    throw new Error(`Could not create storage bucket: ${error.message}`);
  }
}

/**
 * POST /api/admin/upload
 * Accepts one image via multipart/form-data, uploads it to Supabase Storage
 * using the service-role key (bypasses storage RLS), and returns { url }.
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

  const ext  = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `properties/admin-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // ── Upload via service-role client ────────────────────────────────────────
  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY not set — cannot upload server-side
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on this server. Add it to your Netlify environment variables." },
      { status: 500 }
    );
  }

  // Ensure bucket exists (creates it automatically if missing)
  try {
    await ensureBucket(admin);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not verify storage bucket" },
      { status: 500 }
    );
  }

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}
