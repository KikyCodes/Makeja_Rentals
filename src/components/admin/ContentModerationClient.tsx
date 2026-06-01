"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  CheckCircle2,
  Trash2,
  Building2,
  Star,
  MessageSquare,
  User,
  Eye,
  Clock,
} from "lucide-react";
import type { ContentModerationItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ElementType> = {
  property: Building2,
  review: Star,
  message: MessageSquare,
  profile: User,
};

const TYPE_COLORS: Record<string, string> = {
  property: "text-violet-500 bg-violet-50 dark:bg-violet-950/30",
  review: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  message: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  profile: "text-pink-500 bg-pink-50 dark:bg-pink-950/30",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  removed: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

function ModerationCard({
  item,
  onAction,
}: {
  item: ContentModerationItem;
  onAction: (id: string, status: "approved" | "removed") => void;
}) {
  const [loading, setLoading] = useState(false);
  const TypeIcon = TYPE_ICONS[item.content_type] ?? Flag;
  const typeColor = TYPE_COLORS[item.content_type] ?? "text-slate-500 bg-slate-100";

  const act = async (status: "approved" | "removed") => {
    setLoading(true);
    await onAction(item.id, status);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor}`}>
            <TypeIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                {item.content_type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>
                {item.status}
              </span>
              <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
            {/* Flag reason */}
            <div className="mt-2 flex items-start gap-1.5">
              <Flag className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{item.reason}</p>
            </div>
          </div>
        </div>

        {/* Content preview */}
        <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Content preview</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
            &ldquo;{item.content_preview}&rdquo;
          </p>
        </div>

        {/* Author */}
        {item.author && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-[10px] font-bold flex-shrink-0">
              {item.author.full_name?.[0] ?? item.author.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {item.author.full_name ?? "Unknown"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{item.author.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {item.status === "pending" && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex gap-2">
          <button
            onClick={() => act("approved")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => window.open("#", "_blank")}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => act("removed")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function ContentModerationClient() {
  const [items, setItems] = useState<ContentModerationItem[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    fetch(`/api/admin/content?status=${filter}`)
      .then((r) => r.json())
      .then(({ data }) => { setItems(data); setLoading(false); });
  }, [filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAction = async (id: string, status: "approved" | "removed") => {
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchItems();
  };

  const pending = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Content Moderation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Review flagged content across the platform
          </p>
        </div>
        {pending > 0 && (
          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm font-bold px-3 py-1 rounded-full">
            {pending} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        {["all", "pending", "approved", "removed"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
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
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <Flag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No flagged content</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <ModerationCard key={item.id} item={item} onAction={handleAction} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
