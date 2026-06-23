"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageCircle, Loader2, AlertCircle, ShieldCheck, X, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoommateMessage } from "@/types";

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

const AVATAR_GRADIENTS = [
  "from-purple-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-orange-400 to-red-500",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function MyConversations() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<RoommateMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roommates/conversations");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to load conversations");
        return;
      }
      const { data } = await res.json();
      setConversations(data ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const openConversation = async (conv: ConversationRow) => {
    setSelected(conv);
    setMsgLoading(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/roommates/messages?with=${conv.other_user_id}`);
      if (!res.ok) return;
      const { data } = await res.json();
      setMessages(data ?? []);
      // Update unread count locally
      setConversations((prev) =>
        prev.map((c) =>
          c.other_user_id === conv.other_user_id ? { ...c, unread_count: 0 } : c
        )
      );
    } finally {
      setMsgLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/roommates/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selected.other_user_id,
          content: reply.trim(),
        }),
      });
      if (!res.ok) return;
      const { data } = await res.json();
      setMessages((prev) => [...prev, data]);
      setReply("");
      // Update last message
      setConversations((prev) =>
        prev.map((c) =>
          c.other_user_id === selected.other_user_id
            ? { ...c, last_message: reply.trim(), last_message_at: new Date().toISOString() }
            : c
        )
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">No conversations yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Connect with a roommate to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* Conversation list */}
      <div
        className={cn(
          "w-full sm:w-80 border-r border-slate-100 dark:border-slate-800 overflow-y-auto shrink-0",
          selected ? "hidden sm:block" : "block"
        )}
      >
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Conversations</h3>
        </div>
        {conversations.map((conv, i) => {
          const initials =
            conv.other_user?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) ?? "?";
          return (
            <motion.button
              key={conv.other_user_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openConversation(conv)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                selected?.other_user_id === conv.other_user_id &&
                  "bg-purple-50 dark:bg-purple-950"
              )}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                {conv.other_user?.avatar_url ? (
                  <Image
                    src={conv.other_user.avatar_url}
                    alt={conv.other_user.full_name ?? ""}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {conv.other_user?.full_name ?? "Unknown"}
                    {conv.other_user?.is_verified && (
                      <ShieldCheck className="inline w-3 h-3 text-green-500 ml-1" />
                    )}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {conv.last_message}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Message thread */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelected(null)}
              className="sm:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              {selected.other_user?.avatar_url ? (
                <Image
                  src={selected.other_user.avatar_url}
                  alt={selected.other_user.full_name ?? ""}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                  {selected.other_user?.full_name?.[0] ?? "?"}
                </div>
              )}
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {selected.other_user?.full_name ?? "Roommate"}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            )}
            {!msgLoading && messages.map((msg) => {
              const isMine = msg.sender_id !== selected.other_user_id;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      isMine
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm"
                    )}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isMine ? "text-purple-200" : "text-slate-400"
                      )}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("en-KE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center">
          <div className="text-center text-slate-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
