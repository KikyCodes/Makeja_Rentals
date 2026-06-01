import { NextRequest, NextResponse } from "next/server";
import { MOCK_REPORTS } from "@/lib/mock-admin";
import type { Report } from "@/types";

let reports = [...MOCK_REPORTS];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let result = reports;
  if (status && status !== "all") {
    result = result.filter((r) => r.status === status);
  }

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const {
    id,
    status,
    moderator_note,
  }: { id: string; status: Report["status"]; moderator_note?: string } =
    await request.json();

  reports = reports.map((r) =>
    r.id === id
      ? {
          ...r,
          status,
          moderator_note: moderator_note ?? r.moderator_note,
          resolved_at: status === "resolved" || status === "dismissed"
            ? new Date().toISOString()
            : r.resolved_at,
        }
      : r
  );

  return NextResponse.json({ success: true });
}
