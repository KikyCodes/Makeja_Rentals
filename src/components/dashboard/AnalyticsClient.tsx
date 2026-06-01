"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, MessageSquare, Star, BarChart2, CalendarCheck } from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import type { DashboardStats } from "@/types";

// ─── SVG Line Chart ──────────────────────────────────────────────────────────
function LineChart({ data, color = "#16a34a" }: { data: { label: string; value: number }[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 300, H = 100;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.value / max) * H,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-40 overflow-visible">
      <defs>
        <linearGradient id={`lg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#lg-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={H + 16} textAnchor="middle" fontSize="7" fill="currentColor" className="text-slate-400">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Horizontal bar ──────────────────────────────────────────────────────────
function HBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default function AnalyticsClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>;
  }

  // Simulate range data
  const viewData = stats.weekly_views.map((d) => ({ label: d.day, value: d.views }));

  const kpis = [
    { label: "Total Views",    value: stats.total_views.toLocaleString(),  icon: Eye,           color: "bg-blue-50 dark:bg-blue-950 text-blue-600",   delta: "+12%", positive: true },
    { label: "Saves",          value: stats.saves_count,                    icon: Heart,         color: "bg-red-50 dark:bg-red-950 text-red-500",      delta: "+8%",  positive: true },
    { label: "Inquiries",      value: stats.total_inquiries,                icon: MessageSquare, color: "bg-amber-50 dark:bg-amber-950 text-amber-600",delta: "+23%", positive: true },
    { label: "Bookings",       value: stats.total_bookings,                 icon: CalendarCheck, color: "bg-purple-50 dark:bg-purple-950 text-purple-600", delta: "+5%", positive: true },
    { label: "Avg Rating",     value: stats.avg_rating ? `${stats.avg_rating}★` : "—", icon: Star, color: "bg-green-50 dark:bg-green-950 text-green-600", delta: undefined, positive: true },
    { label: "Active Listings",value: stats.active_listings,               icon: BarChart2,     color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300", delta: undefined, positive: true },
  ];

  const maxViews = Math.max(...stats.top_properties.map((p) => p.views));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track performance across all your listings</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? "bg-green-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-green-400"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{k.label}</p>
            {k.delta && (
              <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />{k.delta}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Views chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Views Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Page views across all your listings</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.views_this_week}</p>
            <p className="text-xs text-slate-400">this week</p>
          </div>
        </div>
        <LineChart data={viewData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top properties by views */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top Properties — Views</h3>
          <div className="space-y-4">
            {stats.top_properties.map((p, i) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded text-xs font-black flex items-center justify-center shrink-0 ${i === 0 ? "bg-amber-100 dark:bg-amber-950 text-amber-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.title}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white shrink-0 ml-2">{p.views.toLocaleString()}</span>
                </div>
                <HBar value={p.views} max={maxViews} color={i === 0 ? "#f59e0b" : "#16a34a"} />
              </div>
            ))}
          </div>
        </div>

        {/* Top properties by saves */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top Properties — Saves</h3>
          <div className="space-y-4">
            {[...stats.top_properties].sort((a, b) => b.saves - a.saves).map((p, i) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded text-xs font-black flex items-center justify-center shrink-0 ${i === 0 ? "bg-red-100 dark:bg-red-950 text-red-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.title}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white shrink-0 ml-2">{p.saves} ♥</span>
                </div>
                <HBar value={p.saves} max={Math.max(...stats.top_properties.map((x) => x.saves))} color="#ef4444" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion funnel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Conversion Funnel</h3>
        <p className="text-xs text-slate-400 mb-5">How many viewers convert to inquiries and bookings</p>
        <div className="flex items-end gap-4 justify-center">
          {[
            { label: "Views",    value: stats.total_views,     color: "#3b82f6", pct: 100 },
            { label: "Saves",    value: stats.saves_count,     color: "#ef4444", pct: Math.round((stats.saves_count / stats.total_views) * 100) },
            { label: "Inquiries",value: stats.total_inquiries, color: "#f59e0b", pct: Math.round((stats.total_inquiries / stats.total_views) * 100) },
            { label: "Bookings", value: stats.total_bookings,  color: "#8b5cf6", pct: Math.round((stats.total_bookings / stats.total_views) * 100) },
          ].map((item) => (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.pct}%</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(item.pct, 4) * 1.5}px` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full rounded-t-xl"
                style={{ backgroundColor: item.color, opacity: 0.85 }}
              />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">{item.label}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
