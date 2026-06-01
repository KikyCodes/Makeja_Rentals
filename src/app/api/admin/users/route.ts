import { NextRequest, NextResponse } from "next/server";
import { MOCK_ADMIN_USERS } from "@/lib/mock-admin";
import type { AdminUser } from "@/types";

let users = [...MOCK_ADMIN_USERS];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();

  let result = users;
  if (role && role !== "all") result = result.filter((u) => u.role === role);
  if (status && status !== "all") result = result.filter((u) => u.status === status);
  if (q) {
    result = result.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.full_name?.toLowerCase().includes(q) ?? false)
    );
  }

  return NextResponse.json({ data: result, total: result.length });
}

export async function PATCH(request: NextRequest) {
  const { id, status }: { id: string; status: AdminUser["status"] } = await request.json();
  users = users.map((u) => (u.id === id ? { ...u, status } : u));
  return NextResponse.json({ success: true });
}
