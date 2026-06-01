import { NextResponse } from "next/server";
import { MOCK_STATS } from "@/lib/mock-dashboard";

export async function GET() {
  // In production: query Supabase with auth.uid() as landlord_id
  return NextResponse.json({ data: MOCK_STATS });
}
