"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Flag,
  Clock,
  Eye,
  MapPin,
  DollarSign,
  User,
  AlertTriangle,
} from "lucide-react";
import type { PropertyApprovalItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "flagged", label: "Flagged" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  flagged: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  flagged: Flag,
};

function ApprovalCard({
  item,
  selected,
  onClick,
}: {
  item: PropertyApprovalItem;
  selected: boolean;
  onClick: () => void;
}) {
  const StatusIcon = STATUS_ICONS[item.status];
  const img = item.property.images?.[0]?.url;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border transition-all overflow-hidden ${selected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"} bg-white dark:bg-slate-900`}
    >
      {img && (
        <div className="relative w-full h-28 overflow-hidden">
          <Image src={img} alt={item.property.title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>
            <StatusIcon className="w-2.5 h-2.5" />
            {item.status}
          </span>
          {item.status === "flagged" && (
            <AlertTriangle className="absolute top-2 right-2 w-4 h-4 text-orange-400" />
          )}
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
          {item.property.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-400 truncate">{item.property.area}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <User className="w-3 h-3" />
            <span>{item.landlord.full_name ?? item.landlord.email}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <DollarSign className="w-3 h-3" />
            <span>KES {item.property.price.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
        </p>
      </div>
    </motion.button>
  );
}

function DetailPanel({
  item,
  onAction,
}: {
  item: PropertyApprovalItem;
  onAction: (id: string, status: PropertyApprovalItem["status"], note?: string) => void;
}) {
  const [note, setNote] = useState(item.reviewer_note ?? "");
  const [loading, setLoading] = useState(false);
  const StatusIcon = STATUS_ICONS[item.status];

  const act = async (status: PropertyApprovalItem["status"]) => {
    setLoading(true);
    await onAction(item.id, status, note);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
      {/* Property image */}
      {item.property.images?.[0] && (
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={item.property.images[0].url}
            alt={item.property.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-bold text-white text-lg leading-tight">{item.property.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-white/70" />
              <span className="text-xs text-white/80">{item.property.location}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[item.status]}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {item.status}
          </span>
          <span className="text-xs text-slate-400">
            Submitted {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
          </span>
        </div>

        {/* Property details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Type", value: item.property.type.replace("_", " ") },
            { label: "Price", value: `KES ${item.property.price.toLocaleString()}/mo` },
            { label: "Area", value: item.property.area },
            { label: "Distance", value: item.property.distance_from_campus ? `${item.property.distance_from_campus} km` : "N/A" },
            { label: "Furnishing", value: item.property.furnishing.replace("_", " ") },
            { label: "Gender", value: item.property.gender_preference },
          ].map((d) => (
            <div key={d.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5">
              <p className="text-xs text-slate-400">{d.label}</p>
              <p className="font-semibold text-slate-900 dark:text-white capitalize mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>

        {/* Amenities */}
        {item.property.amenities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {item.property.amenities.map((a) => (
                <span key={a} className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.property.description}</p>
        </div>

        {/* Landlord */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Submitted by</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 text-xs font-bold">
              {item.landlord.full_name?.[0] ?? "L"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.landlord.full_name ?? "Unknown"}</p>
              <p className="text-xs text-slate-400">{item.landlord.email}</p>
            </div>
            {item.landlord.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
            )}
          </div>
        </div>

        {/* Existing reviewer note */}
        {item.reviewer_note && (
          <div className={`rounded-xl p-3 text-sm ${item.status === "flagged" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            <p className="text-xs font-semibold mb-1 opacity-70">Reviewer note</p>
            {item.reviewer_note}
          </div>
        )}

        {/* Note input */}
        {item.status === "pending" && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Add note (optional)
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
            onClick={() => act("flagged")}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Flag className="w-4 h-4" />
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
      {item.status === "flagged" && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => act("approved")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Approve Anyway
          </button>
          <button
            onClick={() => act("rejected")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function PropertiesApprovalClient() {
  const [items, setItems] = useState<PropertyApprovalItem[]>([]);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<PropertyApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    fetch(`/api/admin/properties?status=${status}`)
      .then((r) => r.json())
      .then(({ data }) => { setItems(data); setLoading(false); });
  }, [status]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAction = async (
    id: string,
    newStatus: PropertyApprovalItem["status"],
    note?: string
  ) => {
    await fetch("/api/admin/properties", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, reviewer_note: note }),
    });
    setSelected(null);
    fetchItems();
  };

  const pending = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Property Approval</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review and approve property listings</p>
        </div>
        {pending > 0 && (
          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm font-bold px-3 py-1 rounded-full">
            {pending} pending
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setStatus(t.key); setSelected(null); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${status === t.key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 content-start">
            {items.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
                <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No listings to review</p>
              </div>
            ) : (
              items.map((item) => (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onClick={() => setSelected(item)}
                />
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden"
                >
                  <DetailPanel item={selected} onAction={handleAction} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
                >
                  <div className="text-center">
                    <Eye className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Select a listing to review</p>
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
