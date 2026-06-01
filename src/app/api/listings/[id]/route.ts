import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

/** GET /api/listings/:id */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  // Increment views_count in a real app via Supabase RPC
  return NextResponse.json({ data: { ...property, views_count: property.views_count + 1 } });
}
