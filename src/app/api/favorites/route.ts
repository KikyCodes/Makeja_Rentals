import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory store for demo (replace with Supabase `favorites` table).
 * Keyed by userId → Set<propertyId>
 */
const store = new Map<string, Set<string>>();

function getSet(userId: string) {
  if (!store.has(userId)) store.set(userId, new Set());
  return store.get(userId)!;
}

/** GET /api/favorites?userId=xxx  — list all favorited property IDs */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "anonymous";
  const ids = Array.from(getSet(userId));
  return NextResponse.json({ data: ids });
}
