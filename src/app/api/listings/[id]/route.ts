import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/listings/:id — fetch a single property with images and landlord profile */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // ── 1. Fetch the property row ───────────────────────────────────────────────
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // ── 2. Fetch images (separate query — avoids PostgREST FK cache issues) ─────
  const { data: images } = await supabase
    .from("property_images")
    .select("id, url, is_primary, sort_order, property_id")
    .eq("property_id", id)
    .order("sort_order", { ascending: true });

  // ── 3. Fetch landlord profile ───────────────────────────────────────────────
  const { data: landlord } = await supabase
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
