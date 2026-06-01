import { NextResponse } from "next/server";
import { MOCK_REVENUE } from "@/lib/mock-admin";

export async function GET() {
  return NextResponse.json({ data: MOCK_REVENUE, total: MOCK_REVENUE.length });
}
