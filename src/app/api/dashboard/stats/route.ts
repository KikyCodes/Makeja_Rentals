import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Core stats from properties table (always available)
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, views_count, is_available")
    .eq("landlord_id", user.id);

  const props = properties ?? [];
  const total_listings  = props.length;
  const active_listings = props.filter((p) => p.is_available).length;
  const total_views     = props.reduce((s, p) => s + (p.views_count ?? 0), 0);
  const propIds         = props.map((p) => p.id as string).filter(Boolean);

  const top_properties = [...props]
    .sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
    .slice(0, 5)
    .map((p) => ({ id: p.id as string, title: p.title as string, views: (p.views_count ?? 0) as number, saves: 0 }));

  // Optional counts — tables may not exist yet; silently return 0 on error
  let new_inquiries = 0, total_inquiries = 0;
  let pending_bookings = 0, total_bookings = 0;
  let saves_count = 0;

  if (propIds.length > 0) {
    const { count: fav, error: favErr } = await supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .in("property_id", propIds);
    if (!favErr) saves_count = fav ?? 0;
  }

  const { count: inqNew, error: inqNewErr } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", user.id)
    .eq("status", "new");
  if (!inqNewErr) new_inquiries = inqNew ?? 0;

  const { count: inqAll, error: inqAllErr } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", user.id);
  if (!inqAllErr) total_inquiries = inqAll ?? 0;

  const { count: bkPending, error: bkPendingErr } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", user.id)
    .eq("status", "pending");
  if (!bkPendingErr) pending_bookings = bkPending ?? 0;

  const { count: bkAll, error: bkAllErr } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", user.id);
  if (!bkAllErr) total_bookings = bkAll ?? 0;

  const stats: DashboardStats = {
    total_listings,
    active_listings,
    total_views,
    views_this_week: 0,
    total_inquiries,
    new_inquiries,
    total_bookings,
    pending_bookings,
    saves_count,
    avg_rating: null,
    weekly_views: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, views: 0 })),
    top_properties,
  };

  return NextResponse.json({ data: stats });
}
