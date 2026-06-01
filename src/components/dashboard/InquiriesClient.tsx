"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, CheckCircle2, Clock, XCircle, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Inquiry, InquiryStatus } from "@/types";

const STATUS_MAP: Record<InquiryStatus, { label: string; cls: string }> = {
  new:     { label: "New",     cls: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
  replied: { label: "Replied", cls: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400" },
  closed:  { label: "Closed",  cls: "bg-slate-100 dark:bg-slate-800 text-slate-500" },
};

export default function InquiriesClient() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/inquiries")
      .then((r) => r.json())
      .then(({ data }) => { setInquiries(data); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const markStatus = async (id: string, status: InquiryStatus) => {
    await fetch("/api/dashboard/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status, replied_at: status === "replied" ? new Date().toISOString() : i.replied_at } : i));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    // In production: call Supabase to insert message and update inquiry status
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    await markStatus(selected.id, "replied");
    setReply("");
    setSending(false);
  };

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Inquiries</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{counts.new} new · {counts.all} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "new", "replied", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-green-400"}`}
          >
            {f}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inquiry list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No inquiries in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[600px]">
              {filtered.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selected?.id === inq.id ? "bg-green-50 dark:bg-green-950/20 border-r-2 border-green-500" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${inq.status === "new" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                    {inq.tenant?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{inq.tenant?.full_name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_MAP[inq.status].cls}`}>{STATUS_MAP[inq.status].label}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{inq.subject}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{inq.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(inq.created_at), { addSuffix: true })}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full min-h-64 flex flex-col items-center justify-center gap-3 text-slate-400"
              >
                <MessageSquare className="w-12 h-12 opacity-30" />
                <p className="text-sm">Select an inquiry to view and reply</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold">
                      {selected.tenant?.full_name?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{selected.tenant?.full_name}</p>
                      <p className="text-xs text-slate-400">{selected.tenant?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.status !== "replied" && (
                      <button onClick={() => markStatus(selected.id, "replied")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />Mark replied
                      </button>
                    )}
                    {selected.status !== "closed" && (
                      <button onClick={() => markStatus(selected.id, "closed")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <XCircle className="w-3.5 h-3.5" />Close
                      </button>
                    )}
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Property */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Re: <span className="font-semibold text-slate-700 dark:text-slate-300">{selected.property?.title}</span></p>
                </div>

                {/* Message */}
                <div className="flex-1 px-5 py-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{selected.subject}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_MAP[selected.status].cls}`}>{STATUS_MAP[selected.status].label}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selected.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}</p>
                  </div>

                  {selected.tenant?.phone && (
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        📞 Tenant phone: <span className="font-bold">{selected.tenant.phone}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Reply box */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write your reply…"
                      rows={3}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none transition-all"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim() || sending}
                      className="px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition-colors self-end"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
