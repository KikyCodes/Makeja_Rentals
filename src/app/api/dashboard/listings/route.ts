import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), supabase, user: null };
  return { user, supabase, error: null };
}

/** GET /api/dashboard/listings — current landlord's own properties with images */
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("landlord_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch images via admin client (bypasses RLS on property_images)
  const ids = (properties ?? []).map((p) => p.id as string).filter(Boolean);
  const imagesByProperty: Record<string, unknown[]> = {};
  if (ids.length > 0) {
    let db: ReturnType<typeof createAdminClient> | typeof supabase;
    try { db = createAdminClient(); } catch { db = supabase; }

    const { data: images } = await db
      .from("property_images")
      .select("id, url, is_primary, sort_order, property_id")
      .in("property_id", ids);

    for (const img of images ?? []) {
      const pid = (img as { property_id: string }).property_id;
      if (!imagesByProperty[pid]) imagesByProperty[pid] = [];
      imagesByProperty[pid].push(img);
    }
  }

  const result = (properties ?? []).map((p) => ({
    ...p,
    images: imagesByProperty[p.id as string] ?? [],
  }));

  return NextResponse.json({ data: result, total: result.length });
}

/** PATCH /api/dashboard/listings — toggle is_available (owner only) */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership before updating
  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .eq("id", id)
    .eq("landlord_id", user!.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  const allowed = ["is_available", "is_featured"];
  const safeUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("properties")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/** DELETE /api/dashboard/listings?id=xxx — remove a property (owner only) */
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .eq("id", id)
    .eq("landlord_id", user!.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  // Delete images first via admin client (bypasses RLS)
  let db: ReturnType<typeof createAdminClient> | typeof supabase;
  try { db = createAdminClient(); } catch { db = supabase; }
  await db.from("property_images").delete().eq("property_id", id);

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
