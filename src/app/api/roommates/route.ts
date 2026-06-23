import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

/** GET /api/roommates — paginated + filtered list */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const sp = req.nextUrl.searchParams;

  const area = sp.get("area") ?? "";
  const gender = sp.get("gender") ?? "";
  const budgetMin = sp.get("budget_min") ? Number(sp.get("budget_min")) : null;
  const budgetMax = sp.get("budget_max") ? Number(sp.get("budget_max")) : null;
  const smokingPref = sp.get("smoking_pref") ?? "";
  const petsPref = sp.get("pets_pref") ?? "";
  const sleepSchedule = sp.get("sleep_schedule") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("roommate_posts")
    .select(
      `
      *,
      user:profiles (
        id, full_name, avatar_url, is_verified, role, email, phone, created_at
      )
    `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (area) query = query.eq("area", area);
  if (gender) query = query.eq("gender_preference", gender);
  if (budgetMin !== null) query = query.gte("budget_max", budgetMin);
  if (budgetMax !== null) query = query.lte("budget_min", budgetMax);
  if (smokingPref) query = query.eq("smoking_pref", smokingPref);
  if (petsPref) query = query.eq("pets_pref", petsPref);
  if (sleepSchedule) query = query.eq("sleep_schedule", sleepSchedule);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page: PAGE_SIZE,
    total_pages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}

/** POST /api/roommates — create a new roommate post (auth required) */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Required fields
  const required = ["title", "description", "area", "budget_min", "budget_max", "move_in_date"];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("roommate_posts")
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      area: body.area,
      budget_min: Number(body.budget_min),
      budget_max: Number(body.budget_max),
      move_in_date: body.move_in_date,
      gender_preference: body.gender_preference ?? "any",
      lifestyle_tags: body.lifestyle_tags ?? [],
      is_active: true,
      age: body.age ?? null,
      gender: body.gender ?? null,
      occupation: body.occupation ?? null,
      university: body.university ?? null,
      smoking_pref: body.smoking_pref ?? "no",
      drinking_pref: body.drinking_pref ?? "no",
      pets_pref: body.pets_pref ?? "no",
      cleanliness: body.cleanliness ?? "clean",
      sleep_schedule: body.sleep_schedule ?? "flexible",
      profile_photo_url: body.profile_photo_url ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
