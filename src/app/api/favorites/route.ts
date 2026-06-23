import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/favorites — return the authenticated user's saved properties with full detail */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      property_id,
      created_at,
      property:properties (
        *,
        images:property_images (*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Unwrap to array of Property objects, flagging each as favorited
  const properties = (data ?? [])
    .map((row: { property: unknown }) => {
      const prop = row.property as Record<string, unknown> | null;
      if (!prop) return null;
      return { ...prop, is_favorited: true };
    })
    .filter(Boolean);

  return NextResponse.json({ data: properties });
}
