"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { MOCK_INQUIRIES } from "@/lib/mock-dashboard";
import type { Inquiry } from "@/types";

interface MsgEntry {
  id: string;
  inquiry_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_landlord: boolean;
}

export default function MessagesClient() {
  const [threads, setThreads] = useState<Inquiry[]>(MOCK_INQUIRIES.filter((i) => i.status !== "new"));
  const [active, setActive] = useState<Inquiry | null>(threads[0] ?? null);
  const [messages, setMessages] = useState<MsgEntry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    fetch(`/api/dashboard/messages?inquiry_id=${active.id}`)
      .then((r) => r.json())
      .then(({ data }) => setMessages(data));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !active) return;
    setSending(true);
    const { data } = await fetch("/api/dashboard/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inquiry_id: active.id, content: input }),
    }).then((r) => r.json());
    setMessages((prev) => [...prev, data]);
    setInput("");
    setSending(false);
  };

  const threadMessages = messages.filter((m) => m.inquiry_id === active?.id);
  const lastMsg = (inq: Inquiry) => messages.filter((m) => m.inquiry_id === inq.id).slice(-1)[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Chat threads with interested tenants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden" style={{ minHeight: 520 }}>
        {/* Thread list */}
        <div className="lg:col-span-2 border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversations</p>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {threads.map((inq) => {
              const last = lastMsg(inq);
              return (
                <button
                  key={inq.id}
                  onClick={() => setActive(inq)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${active?.id === inq.id ? "bg-green-50 dark:bg-green-950/20 border-r-2 border-green-500" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {inq.tenant?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{inq.tenant?.full_name}</p>
                      {last && <span className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(new Date(last.created_at), { addSuffix: false })}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{inq.property?.title}</p>
                    {last && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 italic">{last.is_landlord ? "You: " : ""}{last.content}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat window */}
        <div className="lg:col-span-3 flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span className="text-sm">Select a conversation</span>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {active.tenant?.full_name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{active.tenant?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{active.property?.title}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 380 }}>
                <AnimatePresence initial={false}>
                  {threadMessages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-8">No messages yet. Start the conversation!</p>
                  ) : threadMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.is_landlord ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.is_landlord
                          ? "bg-green-600 text-white rounded-tr-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                      }`}>
                        {msg.content}
                        <p className={`text-xs mt-1 ${msg.is_landlord ? "text-green-200" : "text-slate-400"}`}>
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
