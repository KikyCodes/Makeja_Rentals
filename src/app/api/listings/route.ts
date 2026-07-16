import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PaginatedResult, Property } from "@/types";

/**
 * GET /api/listings
 * Fetches real properties from Supabase with full filtering, sorting and pagination.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q          = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const type       = searchParams.get("type") ?? "";
  const area       = searchParams.get("area") ?? "";
  const min        = searchParams.get("min")  ? Number(searchParams.get("min"))  : null;
  const max        = searchParams.get("max")  ? Number(searchParams.get("max"))  : null;
  const furnishing = searchParams.get("furnishing") ?? "";
  const amenities  = searchParams.get("amenities")?.split(",").filter(Boolean) ?? [];
  const gender     = searchParams.get("gender") ?? "";
  const distance   = searchParams.get("distance") ? Number(searchParams.get("distance")) : null;
  const available  = searchParams.get("available") ?? "true"; // default: only available listings
  const sort       = searchParams.get("sort") ?? "newest";
  const page       = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage    = Math.min(24, Math.max(1, Number(searchParams.get("per_page") ?? "12")));

  const supabase = await createClient();

  // ── Step 1: fetch properties (no embedded FK join to avoid schema cache issues) ──
  let query = supabase
    .from("properties")
    .select("*", { count: "exact" });

  // Availability (default: only show available on public site)
  if (available === "true")  query = query.eq("is_available", true);
  if (available === "false") query = query.eq("is_available", false);

  // Keyword search across title, description, location, area
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%,area.ilike.%${q}%`
    );
  }

  // Filters
  if (type)       query = query.eq("type", type);
  if (area)       query = query.eq("area", area);
  if (furnishing) query = query.eq("furnishing", furnishing);
  if (gender && gender !== "any") {
    query = query.or(`gender_preference.eq.any,gender_preference.eq.${gender}`);
  }
  if (min !== null) query = query.gte("price", min);
  if (max !== null) query = query.lte("price", max);
  if (distance !== null) query = query.lte("distance_from_campus", distance);
  if (amenities.length > 0) query = query.contains("amenities", amenities);

  // Sorting
  switch (sort) {
    case "price_asc":  query = query.order("price", { ascending: true });           break;
    case "price_desc": query = query.order("price", { ascending: false });          break;
    case "popular":    query = query.order("views_count", { ascending: false });    break;
    case "oldest":     query = query.order("created_at", { ascending: true });      break;
    default:           query = query.order("created_at", { ascending: false });     break;
  }

  // Pagination
  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("[/api/listings] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Step 2: fetch images for all returned property IDs ─────────────────────
  const ids = (data ?? []).map((p) => p.id as string).filter(Boolean);
  let imagesByProperty: Record<string, unknown[]> = {};
  if (ids.length > 0) {
    const { data: imgData } = await supabase
      .from("property_images")
      .select("id, url, is_primary, sort_order, property_id")
      .in("property_id", ids);
    for (const img of imgData ?? []) {
      const pid = (img as { property_id: string }).property_id;
      if (!imagesByProperty[pid]) imagesByProperty[pid] = [];
      imagesByProperty[pid].push(img);
    }
  }

  // ── Merge images into properties ────────────────────────────────────────────
  const properties = (data ?? []).map((p) => ({
    ...p,
    images: imagesByProperty[p.id as string] ?? [],
  }));

  const total = count ?? 0;
  const body: PaginatedResult<Property> = {
    data: properties as unknown as Property[],
    total,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(total / perPage)),
  };

  return NextResponse.json(body);
}
