import { NextRequest, NextResponse } from "next/server";
import { MOCK_MESSAGES } from "@/lib/mock-dashboard";

let messages = [...MOCK_MESSAGES];

export async function GET(req: NextRequest) {
  const inquiry_id = req.nextUrl.searchParams.get("inquiry_id");
  const data = inquiry_id ? messages.filter((m) => m.inquiry_id === inquiry_id) : messages;
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { inquiry_id, content } = await req.json();
  const msg = {
    id: `m${Date.now()}`,
    inquiry_id,
    sender_id: "l1",
    content,
    created_at: new Date().toISOString(),
    is_landlord: true,
  };
  messages.push(msg);
  return NextResponse.json({ data: msg });
}
