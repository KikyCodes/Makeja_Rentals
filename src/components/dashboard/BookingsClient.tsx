"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, CheckCircle2, XCircle, Clock, Phone,
  Mail, User, Home, MessageSquare,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import type { Booking, BookingStatus } from "@/types";

const STATUS = {
  pending:   { label: "Pending",   cls: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400",   icon: Clock },
  confirmed: { label: "Confirmed", cls: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",       icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "bg-red-100 dark:bg-red-950/60 text-red-600",                              icon: XCircle },
  completed: { label: "Completed", cls: "bg-slate-100 dark:bg-slate-800 text-slate-500",                           icon: CheckCircle2 },
};

function dateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return format(d, "dd MMM yyyy");
  return format(d, "EEE, dd MMM yyyy");
}

export default function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/bookings")
      .then((r) => r.json())
      .then(({ data }) => { setBookings(data); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const updateStatus = async (id: string, status: BookingStatus, landlord_note?: string) => {
    setUpdating(true);
    await fetch("/api/dashboard/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, landlord_note }),
    });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status, landlord_note: landlord_note ?? b.landlord_note } : b));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status, landlord_note: landlord_note ?? prev.landlord_note } : null);
    setUpdating(false);
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Bookings & Viewings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{counts.pending} pending · {counts.all} total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((s) => {
          const { label, cls, icon: Icon } = STATUS[s];
          return (
            <div key={s} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${cls} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{counts[s]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-green-400"}`}
          >
            {f} {f !== "all" && <span className="ml-1 text-xs opacity-70">{counts[f as BookingStatus]}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Booking list */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 py-16 text-center">
              <CalendarCheck className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No bookings in this category</p>
            </div>
          ) : (
            filtered.map((bk) => {
              const { label, cls, icon: Icon } = STATUS[bk.status];
              return (
                <motion.button
                  key={bk.id}
                  layout
                  onClick={() => setSelected(bk)}
                  className={`w-full text-left bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md ${selected?.id === bk.id ? "border-green-400 dark:border-green-700" : "border-slate-100 dark:border-slate-800"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {bk.tenant?.full_name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{bk.tenant?.full_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{bk.property?.title}</p>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${cls}`}>
                          <Icon className="w-3 h-3" />{label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs font-semibold ${isToday(new Date(bk.requested_date)) || isTomorrow(new Date(bk.requested_date)) ? "text-green-600" : "text-slate-500 dark:text-slate-400"}`}>
                          📅 {dateLabel(bk.requested_date)} · {bk.requested_time}
                        </span>
                      </div>
                    </div>
                  </div>
                  {bk.note && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 italic">"{bk.note}"</p>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-slate-400"
              >
                <CalendarCheck className="w-10 h-10 opacity-30" />
                <p className="text-sm">Select a booking to manage</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                    {selected.tenant?.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{selected.tenant?.full_name}</p>
                    <span className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${STATUS[selected.status].cls} px-2 py-0.5 rounded-full`}>
                      {(() => { const I = STATUS[selected.status].icon; return <I className="w-3 h-3" />; })()}
                      {STATUS[selected.status].label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    {selected.tenant?.email}
                  </div>
                  {selected.tenant?.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      {selected.tenant?.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Home className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selected.property?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <CalendarCheck className="w-4 h-4 text-green-600 shrink-0" />
                    {dateLabel(selected.requested_date)} at {selected.requested_time}
                  </div>
                </div>

                {selected.note && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Tenant note</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{selected.note}"</p>
                  </div>
                )}

                {/* Landlord note */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Your note (optional)</label>
                  <textarea
                    value={note || selected.landlord_note || ""}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for this booking…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 resize-none transition-all"
                  />
                </div>

                {/* Actions */}
                {selected.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(selected.id, "confirmed", note || undefined)}
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, "cancelled", note || undefined)}
                      disabled={updating}
                      className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />Decline
                    </button>
                  </div>
                )}
                {selected.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(selected.id, "completed")}
                    disabled={updating}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
