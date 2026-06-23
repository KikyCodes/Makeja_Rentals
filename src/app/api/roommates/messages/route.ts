import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/roommates/messages?with=<userId>
 * Returns conversation messages between the current user and the specified user.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withUserId = req.nextUrl.searchParams.get("with");
  if (!withUserId) {
    return NextResponse.json({ error: "Missing `with` query param" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("roommate_messages")
    .select(
      `
      *,
      sender:profiles!sender_id (
        id, full_name, avatar_url, is_verified
      )
    `
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark received messages as read (fire-and-forget)
  supabase
    .from("roommate_messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("receiver_id", user.id)
    .eq("sender_id", withUserId)
    .eq("is_read", false)
    .then(() => {});

  return NextResponse.json({ data: data ?? [] });
}

/**
 * POST /api/roommates/messages
 * Body: { receiver_id: string; post_id?: string; content: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { receiver_id?: string; post_id?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { receiver_id, post_id, content } = body;

  if (!receiver_id) {
    return NextResponse.json({ error: "receiver_id is required" }, { status: 400 });
  }
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "content cannot be empty" }, { status: 400 });
  }
  if (receiver_id === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("roommate_messages")
    .insert({
      sender_id: user.id,
      receiver_id,
      post_id: post_id ?? null,
      content: content.trim(),
    })
    .select(
      `
      *,
      sender:profiles!sender_id (
        id, full_name, avatar_url, is_verified
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
