"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye, MessageSquare, CalendarCheck, Heart, TrendingUp,
  ArrowRight, Plus, Star, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { DashboardStats, Inquiry, Booking } from "@/types";

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────
function WeeklyChart({ data }: { data: { day: string; views: number }[] }) {
  const max = Math.max(...data.map((d) => d.views), 1);
  const H = 80;
  const W = 100;
  const barW = W / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-36 overflow-visible">
        {data.map((d, i) => {
          const barH = (d.views / max) * H;
          const x = i * barW + barW * 0.15;
          const y = H - barH;
          return (
            <g key={d.day}>
              <rect
                x={x} y={y} width={barW * 0.7} height={barH}
                rx="2"
                fill="url(#barGrad)"
                className="transition-all duration-500"
              />
              <text
                x={x + barW * 0.35} y={H + 14}
                textAnchor="middle" fontSize="5"
                fill="currentColor"
                className="text-slate-400 dark:text-slate-500"
              >
                {d.day}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between text-xs text-slate-400 px-1 -mt-1">
        <span>0</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Views this week</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 30;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * H,
  ]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-16 h-8">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, icon: Icon, color, href }: {
  label: string; value: string | number; delta?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />{delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function OverviewClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/dashboard/inquiries?status=new").then((r) => r.json()),
      fetch("/api/dashboard/bookings?status=pending").then((r) => r.json()),
    ]).then(([s, inq, bk]) => {
      setStats(s.data);
      setInquiries(inq.data.slice(0, 4));
      setBookings(bk.data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Views",     value: stats.total_views.toLocaleString(), delta: "+12%", icon: Eye,           color: "bg-blue-50 dark:bg-blue-950 text-blue-600",   href: "/dashboard/analytics" },
    { label: "New Inquiries",   value: stats.new_inquiries,               delta: undefined, icon: MessageSquare, color: "bg-amber-50 dark:bg-amber-950 text-amber-600", href: "/dashboard/inquiries" },
    { label: "Pending Viewings",value: stats.pending_bookings,            delta: undefined, icon: CalendarCheck, color: "bg-purple-50 dark:bg-purple-950 text-purple-600", href: "/dashboard/bookings" },
    { label: "Saves / Hearts",  value: stats.saves_count,                 delta: "+8%",  icon: Heart,          color: "bg-red-50 dark:bg-red-950 text-red-500",       href: "/dashboard/analytics" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Good morning! 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your listings today.</p>
        </div>
        <Link href="/dashboard/add" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-green-900/20">
          <Plus className="w-4 h-4" /> Add Listing
        </Link>
      </div>

      {/* KPI cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + top properties row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly views chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Weekly Views</h3>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.views_this_week.toLocaleString()}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />+19% vs last week
            </span>
          </div>
          <WeeklyChart data={stats.weekly_views} />
        </div>

        {/* Top properties */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Top Properties</h3>
            <Link href="/dashboard/listings" className="text-xs text-green-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.top_properties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? "bg-amber-100 dark:bg-amber-950 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.views} views · {p.saves} saves</p>
                </div>
                <Sparkline data={[p.views * 0.4, p.views * 0.6, p.views * 0.5, p.views * 0.8, p.views * 0.7, p.views * 0.9, p.views].map(Math.round)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New inquiries + upcoming bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">New Inquiries</h3>
              {stats.new_inquiries > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{stats.new_inquiries}</span>
              )}
            </div>
            <Link href="/dashboard/inquiries" className="text-xs text-green-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {inquiries.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No new inquiries</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {inquiries.map((inq) => (
                <Link key={inq.id} href="/dashboard/inquiries" className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-sm shrink-0">
                    {inq.tenant?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{inq.tenant?.full_name}</p>
                      <span className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(new Date(inq.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{inq.subject}</p>
                    <p className="text-xs text-green-600 truncate mt-0.5">{inq.property?.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming bookings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Upcoming Viewings</h3>
              {stats.pending_bookings > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-white">{stats.pending_bookings}</span>
              )}
            </div>
            <Link href="/dashboard/bookings" className="text-xs text-green-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No pending viewings</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((bk) => (
                <div key={bk.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm shrink-0">
                    {bk.tenant?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{bk.tenant?.full_name}</p>
                      <StatusPill status={bk.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{bk.property?.title}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                      {new Date(bk.requested_date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })} · {bk.requested_time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/add",          label: "Add Property",   icon: Plus,        color: "bg-green-600 text-white" },
          { href: "/dashboard/listings",     label: "Manage Listings",icon: Eye,         color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300" },
          { href: "/dashboard/inquiries",    label: "Reply Inquiries",icon: MessageSquare, color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300" },
          { href: "/dashboard/verification", label: "Get Verified",   icon: CheckCircle2,color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 hover:shadow-md text-center ${a.color}`}>
            <a.icon className="w-5 h-5" />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:   { label: "Pending",   cls: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",   Icon: Clock },
    confirmed: { label: "Confirmed", cls: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",   Icon: CheckCircle2 },
    cancelled: { label: "Cancelled", cls: "bg-red-100 dark:bg-red-950 text-red-600",                              Icon: XCircle },
    completed: { label: "Done",      cls: "bg-slate-100 dark:bg-slate-800 text-slate-500",                        Icon: CheckCircle2 },
  };
  const { label, cls, Icon } = map[status] ?? map.pending;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}
