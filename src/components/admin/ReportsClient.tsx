"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import type { Report } from "@/types";
import { formatDistanceToNow } from "date-fns";

const STATUS_TABS = ["all", "open", "investigating", "resolved", "dismissed"];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  investigating: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  dismissed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const TARGET_ICONS: Record<string, React.ElementType> = {
  property: Building2,
  review: Star,
  message: MessageSquare,
  profile: User,
};

function ReportCard({
  report,
  selected,
  onClick,
}: {
  report: Report;
  selected: boolean;
  onClick: () => void;
}) {
  const TargetIcon = TARGET_ICONS[report.target_type] ?? FileText;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${selected ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
          <TargetIcon className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{report.reason}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[report.status]}`}>
              {report.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{report.description}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-slate-400 capitalize">{report.target_type}</span>
            <span className="text-[10px] text-slate-400">
              by {report.reporter.full_name ?? report.reporter.email}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function ReportDetail({
  report,
  onAction,
}: {
  report: Report;
  onAction: (id: string, status: Report["status"], note?: string) => void;
}) {
  const [note, setNote] = useState(report.moderator_note ?? "");
  const [loading, setLoading] = useState(false);
  const TargetIcon = TARGET_ICONS[report.target_type] ?? FileText;

  const act = async (status: Report["status"]) => {
    setLoading(true);
    await onAction(report.id, status, note);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <TargetIcon className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white">{report.reason}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {report.target_type} report
            </p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[report.status]}`}>
            {report.status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Description */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">Report Description</p>
          <p className="text-sm text-red-700 dark:text-red-300">{report.description}</p>
        </div>

        {/* Reporter */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-2">Reported by</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {report.reporter.full_name?.[0] ?? report.reporter.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {report.reporter.full_name ?? "Anonymous"}
              </p>
              <p className="text-xs text-slate-400">{report.reporter.email}</p>
            </div>
          </div>
        </div>

        {/* Target info */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Target</p>
          <div className="flex items-center gap-2">
            <TargetIcon className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{report.target_type}</p>
              <p className="text-xs text-slate-400 font-mono">{report.target_id}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Timeline</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Reported</span>
              <span className="text-slate-600 dark:text-slate-300 ml-auto">
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </span>
            </div>
            {report.resolved_at && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-400">Resolved</span>
                <span className="text-slate-600 dark:text-slate-300 ml-auto">
                  {formatDistanceToNow(new Date(report.resolved_at), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Moderator note (existing) */}
        {report.moderator_note && report.status !== "open" && (
          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Moderator note</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{report.moderator_note}</p>
          </div>
        )}

        {/* Note input for pending */}
        {(report.status === "open" || report.status === "investigating") && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Moderator note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add investigation notes or resolution reason…"
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {(report.status === "open" || report.status === "investigating") && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          {report.status === "open" && (
            <button
              onClick={() => act("investigating")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              Investigate
            </button>
          )}
          <button
            onClick={() => act("resolved")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Resolve
          </button>
          <button
            onClick={() => act("dismissed")}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(() => {
    fetch(`/api/admin/reports?status=${status}`)
      .then((r) => r.json())
      .then(({ data }) => { setReports(data); setLoading(false); });
  }, [status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (id: string, newStatus: Report["status"], note?: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, moderator_note: note }),
    });
    setSelected(null);
    fetchReports();
  };

  const filtered = q
    ? reports.filter(
        (r) =>
          r.reason.toLowerCase().includes(q.toLowerCase()) ||
          r.description.toLowerCase().includes(q.toLowerCase())
      )
    : reports;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage user-submitted reports and moderation actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reports…"
            className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 w-52"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setStatus(t); setSelected(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${status === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No reports found</p>
              </div>
            ) : (
              filtered.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  selected={selected?.id === r.id}
                  onClick={() => setSelected(r)}
                />
              ))
            )}
          </div>
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="sticky top-20">
                  <ReportDetail report={selected} onAction={handleAction} />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Select a report to review</p>
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
