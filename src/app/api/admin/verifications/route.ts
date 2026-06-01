import { NextRequest, NextResponse } from "next/server";
import { MOCK_VERIFICATION_REQUESTS } from "@/lib/mock-admin";
import type { VerificationRequest } from "@/types";

let verifications = [...MOCK_VERIFICATION_REQUESTS];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let result = verifications;
  if (status && status !== "all") {
    result = result.filter((v) => v.status === status);
  }

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const {
    id,
    status,
    reviewer_note,
  }: { id: string; status: VerificationRequest["status"]; reviewer_note?: string } =
    await request.json();

  verifications = verifications.map((v) =>
    v.id === id
      ? {
          ...v,
          status,
          reviewer_note: reviewer_note ?? v.reviewer_note,
          reviewed_at: new Date().toISOString(),
        }
      : v
  );

  return NextResponse.json({ success: true });
}
