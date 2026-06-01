"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  XCircle,
  FileText,
  User,
  Building2,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import type { VerificationRequest } from "@/types";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ElementType> = {
  landlord: Building2,
  student: GraduationCap,
  property: Building2,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

function VerificationCard({
  item,
  selected,
  onClick,
}: {
  item: VerificationRequest;
  selected: boolean;
  onClick: () => void;
}) {
  const TypeIcon = TYPE_ICONS[item.type];

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${selected ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {item.user.full_name ?? item.user.email}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>
              {item.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{item.type} verification</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-slate-400">
              {item.documents.length} document{item.documents.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function VerificationDetail({
  item,
  onAction,
}: {
  item: VerificationRequest;
  onAction: (id: string, status: VerificationRequest["status"], note?: string) => void;
}) {
  const [note, setNote] = useState(item.reviewer_note ?? "");
  const [loading, setLoading] = useState(false);
  const TypeIcon = TYPE_ICONS[item.type];

  const act = async (status: VerificationRequest["status"]) => {
    setLoading(true);
    await onAction(item.id, status, note);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <TypeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white capitalize">
              {item.type} Verification Request
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Submitted {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
            </p>
          </div>
          <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[item.status]}`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* User */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-2">Applicant</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {item.user.full_name?.[0] ?? item.user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.user.full_name ?? "Unknown"}</p>
              <p className="text-xs text-slate-400">{item.user.email}</p>
              <p className="text-xs text-slate-400 capitalize">{item.user.role}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Documents Submitted</p>
          <div className="space-y-2">
            {item.documents.map((doc) => (
              <div key={doc.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{doc.name}</span>
                <a
                  href={doc.url}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Applicant notes */}
        {item.notes && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Applicant note</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{item.notes}</p>
          </div>
        )}

        {/* Prior reviewer note */}
        {item.reviewer_note && item.status !== "pending" && (
          <div className={`rounded-xl p-3 border text-sm ${item.status === "approved" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"}`}>
            <p className="text-xs font-semibold mb-1 opacity-70">Admin note</p>
            {item.reviewer_note}
          </div>
        )}

        {/* Note textarea */}
        {item.status === "pending" && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Admin note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Reason for approval or rejection…"
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {item.status === "pending" && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => act("approved")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => act("rejected")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerificationsClient() {
  const [items, setItems] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    fetch(`/api/admin/verifications?status=${filter}`)
      .then((r) => r.json())
      .then(({ data }) => { setItems(data); setLoading(false); });
  }, [filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAction = async (
    id: string,
    status: VerificationRequest["status"],
    note?: string
  ) => {
    await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewer_note: note }),
    });
    setSelected(null);
    fetchItems();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Verifications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review identity and property verification requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        {["all", "pending", "approved", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setSelected(null); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all ${filter === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
                <BadgeCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No verification requests</p>
              </div>
            ) : (
              items.map((item) => (
                <VerificationCard
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onClick={() => setSelected(item)}
                />
              ))
            )}
          </div>
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="sticky top-20"
                >
                  <VerificationDetail item={selected} onAction={handleAction} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
                >
                  <div className="text-center">
                    <BadgeCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Select a request to review</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
