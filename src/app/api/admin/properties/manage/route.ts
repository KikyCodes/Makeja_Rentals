import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Verify the calling user is an admin using app_metadata (embedded in JWT). */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const isAdmin = (user.app_metadata as Record<string, unknown>)?.role === "admin";
  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/**
 * GET /api/admin/properties/manage — list all properties with images.
 *
 * Uses the service-role client (bypasses RLS) so the admin sees every property
 * regardless of is_published / approval_status. Falls back to the session client
 * if SUPABASE_SERVICE_ROLE_KEY is not configured (e.g. missing Netlify env var).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  // Prefer service-role (bypasses RLS entirely); fall back to session client
  let supabase: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const sp = req.nextUrl.searchParams;
  const page     = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = 20;
  const from     = (page - 1) * pageSize;
  const search   = sp.get("search") ?? "";
  const available = sp.get("available");
  const type     = sp.get("type") ?? "";
  const sort     = sp.get("sort") ?? "newest";

  // ── Step 1: fetch properties ────────────────────────────────────────────────
  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .range(from, from + pageSize - 1);

  switch (sort) {
    case "oldest":     query = query.order("created_at", { ascending: true });  break;
    case "price_asc":  query = query.order("price", { ascending: true });       break;
    case "price_desc": query = query.order("price", { ascending: false });      break;
    default:           query = query.order("created_at", { ascending: false }); break;
  }

  if (search)                query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
  if (available === "true")  query = query.eq("is_available", true);
  if (available === "false") query = query.eq("is_available", false);
  if (type)                  query = query.eq("type", type);

  const { data, error: dbError, count } = await query;
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  // ── Step 2: fetch images for the returned property IDs ──────────────────────
  const ids = (data ?? []).map((p) => p.id as string).filter(Boolean);
  const imagesByProperty: Record<string, unknown[]> = {};
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

  // ── Merge ──────────────────────────────────────────────────────────────────
  const properties = (data ?? []).map((p) => ({
    ...p,
    images: imagesByProperty[p.id as string] ?? [],
  }));

  return NextResponse.json({
    data: properties,
    total: count ?? 0,
    page,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  });
}

/** POST /api/admin/properties/manage — create a new property */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required = ["title", "description", "type", "price", "area", "location"];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: property, error: insertError } = await admin
    .from("properties")
    .insert({
      title: body.title,
      description: body.description,
      type: body.type,
      price: Number(body.price),
      price_period: body.price_period ?? "per_month",
      location: body.location,
      area: body.area,
      bedrooms: Number(body.bedrooms ?? 0),
      bathrooms: Number(body.bathrooms ?? 1),
      max_occupants: Number(body.max_occupants ?? 2),
      furnishing: body.furnishing ?? "semi_furnished",
      amenities: body.amenities ?? [],
      rules: body.rules ?? [],
      gender_preference: body.gender_preference ?? "any",
      distance_from_campus: body.distance_from_campus ? Number(body.distance_from_campus) : null,
      is_available: body.is_available !== false,
      is_published: true,          // admin-created properties go live immediately
      approval_status: "approved", // admin-created properties are pre-approved
      is_verified: true,
      is_featured: body.is_featured === true,
      landlord_id: auth.user!.id,
      landlord_name: (body.landlord_name as string)?.trim() || null,
      landlord_phone: (body.landlord_phone as string)?.trim() || null,
      landlord_whatsapp: (body.landlord_whatsapp as string)?.trim() || null,
      views_count: 0,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Insert image URLs if provided
  const imageUrls: string[] = (body.image_urls as string[]) ?? [];
  if (imageUrls.length > 0) {
    await admin.from("property_images").insert(
      imageUrls.map((url, i) => ({
        property_id: property.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      }))
    );
  }

  return NextResponse.json({ data: property }, { status: 201 });
}

/** PATCH /api/admin/properties/manage — update a property */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing property id" }, { status: 400 });

  const admin = createAdminClient();

  const allowed = [
    "title", "description", "type", "price", "price_period", "location", "area",
    "bedrooms", "bathrooms", "max_occupants", "furnishing", "amenities", "rules",
    "gender_preference", "distance_from_campus", "is_available", "is_featured", "is_verified",
    "is_published", "approval_status",
    "landlord_name", "landlord_phone", "landlord_whatsapp",
  ];
  const safeUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  const { data, error: updateError } = await admin
    .from("properties")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Handle image replacements — use sort_order (the actual column name)
  if (Array.isArray(updates.image_urls)) {
    await admin.from("property_images").delete().eq("property_id", id);
    const urls = updates.image_urls as string[];
    if (urls.length > 0) {
      await admin.from("property_images").insert(
        urls.map((url, i) => ({ property_id: id, url, is_primary: i === 0, sort_order: i }))
      );
    }
  }

  return NextResponse.json({ data });
}

/** DELETE /api/admin/properties/manage?id=xxx — delete a property */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();

  // Delete images first (FK constraint)
  await admin.from("property_images").delete().eq("property_id", id);
  const { error: delError } = await admin.from("properties").delete().eq("id", id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
