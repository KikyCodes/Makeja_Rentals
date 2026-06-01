import { NextRequest, NextResponse } from "next/server";
import { MOCK_INQUIRIES } from "@/lib/mock-dashboard";

let inquiries = [...MOCK_INQUIRIES];

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const data = status ? inquiries.filter((i) => i.status === status) : inquiries;
  return NextResponse.json({ data, total: data.length });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  inquiries = inquiries.map((i) =>
    i.id === id ? { ...i, status, replied_at: status === "replied" ? new Date().toISOString() : i.replied_at } : i
  );
  return NextResponse.json({ success: true });
}
