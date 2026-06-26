import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Verify the calling user is an admin. Returns the user or throws a 401/403 response. */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** GET /api/admin/properties/manage — list all properties with images */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = sp.get("search") ?? "";
  const available = sp.get("available");

  let query = admin
    .from("properties")
    .select("*, images:property_images(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("title", `%${search}%`);
  if (available === "true") query = query.eq("is_available", true);
  if (available === "false") query = query.eq("is_available", false);

  const { data, error: dbError, count } = await query;
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
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
      is_verified: true,   // admin-created properties are auto-verified
      is_featured: body.is_featured === true,
      landlord_id: auth.user!.id, // admin owns it
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
        order: i,
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

  // Whitelist updatable fields
  const allowed = [
    "title", "description", "type", "price", "price_period", "location", "area",
    "bedrooms", "bathrooms", "max_occupants", "furnishing", "amenities", "rules",
    "gender_preference", "distance_from_campus", "is_available", "is_featured", "is_verified",
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

  // Handle image replacements
  if (Array.isArray(updates.image_urls)) {
    await admin.from("property_images").delete().eq("property_id", id);
    const urls = updates.image_urls as string[];
    if (urls.length > 0) {
      await admin.from("property_images").insert(
        urls.map((url, i) => ({ property_id: id, url, is_primary: i === 0, order: i }))
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
