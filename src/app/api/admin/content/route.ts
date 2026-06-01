import { NextRequest, NextResponse } from "next/server";
import { MOCK_CONTENT_MODERATION } from "@/lib/mock-admin";

let items = [...MOCK_CONTENT_MODERATION];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let result = items;
  if (status && status !== "all") {
    result = result.filter((c) => c.status === status);
  }

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const { id, status }: { id: string; status: "pending" | "approved" | "removed" } =
    await request.json();
  items = items.map((c) => (c.id === id ? { ...c, status } : c));
  return NextResponse.json({ success: true });
}
