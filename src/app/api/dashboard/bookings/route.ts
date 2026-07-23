import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: [], total: 0 });

  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("bookings")
    .select("*")
    .eq("landlord_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  // Gracefully return empty array if the bookings table doesn't exist yet
  if (error) return NextResponse.json({ data: [], total: 0 });

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, landlord_note } = await req.json();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (landlord_note !== undefined) updates.landlord_note = landlord_note;

  const { error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .eq("landlord_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
