import { NextRequest, NextResponse } from "next/server";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-dashboard";

let notifications = [...MOCK_NOTIFICATIONS];

export async function GET() {
  return NextResponse.json({ data: notifications });
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  if (id === "all") {
    notifications = notifications.map((n) => ({ ...n, is_read: true }));
  } else {
    notifications = notifications.map((n) => n.id === id ? { ...n, is_read: true } : n);
  }
  return NextResponse.json({ success: true });
}
