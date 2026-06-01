import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import type { Property, PaginatedResult } from "@/types";

/**
 * GET /api/listings
 *
 * Query params:
 *   q           — keyword search
 *   type        — property type
 *   area        — area name
 *   min         — min price
 *   max         — max price
 *   furnishing  — furnished | semi_furnished | unfurnished
 *   amenities   — comma-separated amenity list
 *   gender      — any | male | female
 *   distance    — max km from campus
 *   available   — true | false  (default: no filter)
 *   sort        — newest | price_asc | price_desc | popular | distance
 *   page        — page number (default 1)
 *   per_page    — results per page (default 12)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q         = searchParams.get("q")?.toLowerCase().trim();
  const type      = searchParams.get("type");
  const area      = searchParams.get("area");
  const min       = searchParams.get("min")       ? Number(searchParams.get("min"))       : null;
  const max       = searchParams.get("max")       ? Number(searchParams.get("max"))       : null;
  const furnishing = searchParams.get("furnishing");
  const amenities  = searchParams.get("amenities")?.split(",").filter(Boolean) ?? [];
  const gender     = searchParams.get("gender");
  const distance   = searchParams.get("distance") ? Number(searchParams.get("distance")) : null;
  const available  = searchParams.get("available");
  const sort       = searchParams.get("sort") ?? "newest";
  const page       = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage    = Math.min(24, Math.max(1, Number(searchParams.get("per_page") ?? "12")));

  // ── Filter ─────────────────────────────────────────────────────────────────
  let results: Property[] = MOCK_PROPERTIES.filter((p) => {
    if (q) {
      const haystack = `${p.title} ${p.description} ${p.location} ${p.area}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (type && p.type !== type) return false;
    if (area && p.area !== area) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    if (furnishing && p.furnishing !== furnishing) return false;
    if (amenities.length > 0) {
      if (!amenities.every((a) => p.amenities.includes(a))) return false;
    }
    if (gender && gender !== "any" && p.gender_preference !== "any" && p.gender_preference !== gender) return false;
    if (distance !== null && p.distance_from_campus !== null) {
      if (p.distance_from_campus > distance) return false;
    }
    if (available === "true"  && !p.is_available) return false;
    if (available === "false" &&  p.is_available) return false;
    return true;
  });

  // ── Sort ────────────────────────────────────────────────────────────────────
  switch (sort) {
    case "price_asc":
      results = results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results = results.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      results = results.sort((a, b) => b.views_count - a.views_count);
      break;
    case "distance":
      results = results.sort((a, b) => (a.distance_from_campus ?? 999) - (b.distance_from_campus ?? 999));
      break;
    case "newest":
    default:
      results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // ── Paginate ────────────────────────────────────────────────────────────────
  const total       = results.length;
  const totalPages  = Math.ceil(total / perPage);
  const offset      = (page - 1) * perPage;
  const paged       = results.slice(offset, offset + perPage);

  const body: PaginatedResult<Property> = {
    data: paged,
    total,
    page,
    per_page: perPage,
    total_pages: Math.max(1, totalPages),
  };

  return NextResponse.json(body);
}
