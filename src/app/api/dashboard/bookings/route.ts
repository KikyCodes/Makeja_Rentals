import { NextRequest, NextResponse } from "next/server";
import { MOCK_BOOKINGS } from "@/lib/mock-dashboard";

let bookings = [...MOCK_BOOKINGS];

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const data = status ? bookings.filter((b) => b.status === status) : bookings;
  return NextResponse.json({ data, total: data.length });
}

export async function PATCH(req: NextRequest) {
  const { id, status, landlord_note } = await req.json();
  bookings = bookings.map((b) =>
    b.id === id
      ? { ...b, status, landlord_note: landlord_note ?? b.landlord_note, updated_at: new Date().toISOString() }
      : b
  );
  return NextResponse.json({ success: true });
}
