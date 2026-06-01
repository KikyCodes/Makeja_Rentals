import { NextRequest, NextResponse } from "next/server";

/** Shared in-memory store (same module-scope Map as favorites/route.ts won't be shared in Next.js).
 *  In production this would call Supabase. For demo we use localStorage on the client. */

/** POST /api/favorites/:propertyId  — add to favorites */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  // In production: INSERT INTO favorites (user_id, property_id) VALUES (...)
  return NextResponse.json({ success: true, propertyId, action: "added" });
}

/** DELETE /api/favorites/:propertyId  — remove from favorites */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  // In production: DELETE FROM favorites WHERE user_id = ? AND property_id = ?
  return NextResponse.json({ success: true, propertyId, action: "removed" });
}
