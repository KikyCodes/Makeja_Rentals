import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/listings/:id — fetch a single property with images and landlord profile */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // ── 1. Fetch the property row (anon client — respects RLS, only shows published) ─
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Use service-role client for images + profile to bypass any RLS restrictions
  // on those tables. Falls back to the anon client if the key isn't configured.
  let db: ReturnType<typeof createAdminClient> | typeof supabase;
  try {
    db = createAdminClient();
  } catch {
    db = supabase;
  }

  // ── 2. Fetch images (admin client bypasses RLS on property_images) ───────────
  const { data: images } = await db
    .from("property_images")
    .select("id, url, is_primary, sort_order, property_id")
    .eq("property_id", id)
    .order("sort_order", { ascending: true });

  // ── 3. Fetch landlord profile (admin client bypasses RLS on profiles) ────────
  const { data: landlord } = await db
    .from("profiles")
    .select("id, full_name, phone, avatar_url, is_verified, email, role")
    .eq("id", property.landlord_id)
    .single();

  // ── 4. Record view (best-effort, never block the response) ──────────────────
  void (async () => {
    try { await supabase.rpc("record_property_view", { p_property_id: id }); } catch {}
  })();

  return NextResponse.json({
    data: {
      ...property,
      images: images ?? [],
      landlord: landlord ?? null,
    },
  });
}
