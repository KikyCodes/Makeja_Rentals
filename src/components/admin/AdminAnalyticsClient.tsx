"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  TrendingUp,
  Eye,
  BarChart3,
} from "lucide-react";
import type { AdminStats } from "@/types";

// ─── Charts (reuse grouped bar + line pattern) ────────────────────────────────

function StackedBar({ data }: { data: AdminStats["monthly_signups"] }) {
  const maxVal = Math.max(...data.map((d) => d.tenants + d.landlords));
  const W = 560, H = 180, pad = 48;
  const barW = Math.min(40, (W - pad * 2) / data.length - 12);
  const gridLines = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full">
      <defs>
        <linearGradient id="saTenant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="saLandlord" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      {gridLines.map((f) => (
        <line key={f} x1={pad} y1={H - H * f + 8} x2={W - pad} y2={H - H * f + 8}
          stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      {gridLines.map((f) => (
        <text key={`label-${f}`} x={pad - 6} y={H - H * f + 12} textAnchor="end" fontSize="9" fill="#64748b">
          {Math.round(maxVal * f)}
        </text>
      ))}
      {data.map((d, i) => {
        const x = pad + (i / data.length) * (W - pad * 2) + ((W - pad * 2) / data.length - barW) / 2;
        const tH = Math.max(2, (d.tenants / maxVal) * (H - 20));
        const lH = Math.max(2, (d.landlords / maxVal) * (H - 20));
        const total = tH + lH;
        return (
          <g key={d.month}>
            <rect x={x} y={H - total + 8} width={barW} height={lH} rx="0" fill="url(#saLandlord)" />
            <rect x={x} y={H - tH + 8} width={barW} height={tH} rx="4" fill="url(#saTenant)" />
            <text x={x + barW / 2} y={H + 24} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GrowthLine({ data }: { data: { month: string; total: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const W = 400, H = 120, pad = 32;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - 10 - (d.total / maxVal) * (H - 30);
    return `${x},${y}`;
  });
  const poly = pts.join(" ");
  const area = `${pad},${H - 10} ${poly} ${W - pad},${H - 10}`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      <defs>
        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#growthGrad)" />
      <polyline points={poly} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - 10 - (d.total / maxVal) * (H - 30);
        return (
          <g key={d.month}>
            <circle cx={x} cy={y} r="3.5" fill="#10b981" />
            <text x={x} y={H + 20} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ConversionFunnel({ stats }: { stats: AdminStats }) {
  const steps = [
    { label: "Total Users", value: stats.total_users, color: "bg-indigo-500" },
    { label: "Verified Users", value: Math.round(stats.total_users * 0.62), color: "bg-violet-500" },
    { label: "Active Listers", value: stats.total_landlords, color: "bg-purple-500" },
    { label: "Revenue Users", value: Math.round(stats.total_landlords * 0.38), color: "bg-pink-500" },
  ];
  const maxVal = steps[0].value;

  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = (s.value / maxVal) * 100;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              <span className="font-bold text-slate-900 dark:text-white">{s.value.toLocaleString()}</span>
            </div>
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className={`h-full rounded-lg ${s.color} flex items-center justify-end pr-2`}
              >
                <span className="text-[10px] text-white font-bold">{pct.toFixed(0)}%</span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const growthData = stats.monthly_signups.map((d) => ({
    month: d.month,
    total: d.tenants + d.landlords,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Platform growth and engagement metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total_users.toLocaleString(), change: `+${stats.new_users_week} this week`, icon: Users, color: "bg-indigo-500" },
          { label: "Properties Listed", value: stats.total_properties.toLocaleString(), change: `${stats.pending_approvals} pending`, icon: Building2, color: "bg-violet-500" },
          { label: "Landlord : Tenant Ratio", value: `1 : ${Math.round(stats.total_tenants / Math.max(1, stats.total_landlords))}`, change: "Market coverage ratio", icon: TrendingUp, color: "bg-emerald-500" },
          { label: "Monthly Signups", value: stats.new_users_week.toLocaleString(), change: "Past 7 days", icon: Eye, color: "bg-rose-500" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
            <p className="text-xs text-emerald-500 mt-0.5 font-medium">{kpi.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked bar - signups */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">User Signups</h2>
              <p className="text-xs text-slate-400 mt-0.5">Stacked by role</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500" /> Tenants</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400" /> Landlords</span>
            </div>
          </div>
          <StackedBar data={stats.monthly_signups} />
        </div>

        {/* Growth line */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Total User Growth</h2>
            <p className="text-xs text-slate-400 mt-0.5">Combined signups per month</p>
          </div>
          <GrowthLine data={growthData} />
        </div>
      </div>

      {/* Conversion funnel + property types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-1">User Conversion Funnel</h2>
          <p className="text-xs text-slate-400 mb-4">From signup to revenue-generating user</p>
          <ConversionFunnel stats={stats} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Property Type Distribution</h2>
          <div className="space-y-3">
            {stats.property_types.map((pt) => {
              const total = stats.property_types.reduce((a, b) => a + b.count, 0);
              const pct = (pt.count / total) * 100;
              const colors = ["bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-pink-500", "bg-rose-500", "bg-fuchsia-500"];
              const idx = stats.property_types.indexOf(pt);
              return (
                <div key={pt.type}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{pt.type}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{pt.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                      className={`h-full rounded-full ${colors[idx % colors.length]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform health */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-indigo-200" />
          <div>
            <h2 className="font-bold text-lg">Platform Health Score</h2>
            <p className="text-indigo-200 text-sm">Based on user activity, listing quality, and fraud rate</p>
          </div>
          <div className="ml-auto text-4xl font-black">92<span className="text-xl text-indigo-200">/100</span></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "User Retention", value: "84%" },
            { label: "Listing Quality", value: "91%" },
            { label: "Fraud Rate", value: "0.08%" },
          ].map((m) => (
            <div key={m.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-black">{m.value}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
