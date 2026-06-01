import { NextResponse } from "next/server";
import { MOCK_ADMIN_STATS } from "@/lib/mock-admin";

export async function GET() {
  return NextResponse.json({ data: MOCK_ADMIN_STATS });
}
