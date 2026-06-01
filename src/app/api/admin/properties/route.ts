import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROPERTY_APPROVALS } from "@/lib/mock-admin";
import type { PropertyApprovalItem } from "@/types";

let approvals = [...MOCK_PROPERTY_APPROVALS];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let result = approvals;
  if (status && status !== "all") {
    result = result.filter((a) => a.status === status);
  }

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const {
    id,
    status,
    reviewer_note,
  }: { id: string; status: PropertyApprovalItem["status"]; reviewer_note?: string } =
    await request.json();

  approvals = approvals.map((a) =>
    a.id === id
      ? {
          ...a,
          status,
          reviewer_note: reviewer_note ?? a.reviewer_note,
          reviewed_at: new Date().toISOString(),
        }
      : a
  );

  return NextResponse.json({ success: true });
}
