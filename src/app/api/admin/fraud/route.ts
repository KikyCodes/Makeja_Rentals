import { NextRequest, NextResponse } from "next/server";
import { MOCK_FRAUD_ALERTS } from "@/lib/mock-admin";

let alerts = [...MOCK_FRAUD_ALERTS];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const resolved = searchParams.get("resolved");

  let result = alerts;
  if (resolved === "false") result = result.filter((a) => !a.is_resolved);
  if (resolved === "true") result = result.filter((a) => a.is_resolved);

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const { id, is_resolved }: { id: string; is_resolved: boolean } = await request.json();
  alerts = alerts.map((a) => (a.id === id ? { ...a, is_resolved } : a));
  return NextResponse.json({ success: true });
}
