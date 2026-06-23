import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ConversationRow {
  other_user_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

/**
 * GET /api/roommates/conversations
 * Returns all conversations for the current user, grouped by the other participant,
 * with the latest message preview and unread count.
 */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("roommate_messages")
    .select(
      `
      id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at,
      sender:profiles!sender_id (id, full_name, avatar_url, is_verified),
      receiver:profiles!receiver_id (id, full_name, avatar_url, is_verified)
    `
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group messages by conversation (other party)
  const conversationMap = new Map<string, ConversationRow>();

  for (const msg of messages ?? []) {
    const isSender = msg.sender_id === user.id;
    const otherId = isSender ? msg.receiver_id : msg.sender_id;
    const otherProfile = (isSender ? msg.receiver : msg.sender) as unknown as ConversationRow["other_user"];

    if (!conversationMap.has(otherId)) {
      conversationMap.set(otherId, {
        other_user_id: otherId,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: !isSender && !msg.is_read ? 1 : 0,
        other_user: otherProfile,
      });
    } else {
      const existing = conversationMap.get(otherId)!;
      // Accumulate unread count (messages are ordered desc so first hit is latest)
      if (!isSender && !msg.is_read) {
        existing.unread_count += 1;
      }
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  return NextResponse.json({ data: conversations });
}
