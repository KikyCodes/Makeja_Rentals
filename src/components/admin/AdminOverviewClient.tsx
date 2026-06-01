"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  ShieldAlert,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { AdminStats } from "@/types";

// ─── SVG Charts ───────────────────────────────────────────────────────────────

function GroupedBarChart({ data }: { data: AdminStats["monthly_signups"] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.tenants, d.landlords]));
  const W = 480, H = 160, pad = 40, barW = 14, gap = 8;
  const groupW = barW * 2 + gap;
  const groupSpacing = (W - pad * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full">
      <defs>
        <linearGradient id="tenantGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="landlordGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad} y1={H - H * f + 10} x2={W - pad} y2={H - H * f + 10}
          stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4"
        />
      ))}
      {data.map((d, i) => {
        const x = pad + i * groupSpacing + (groupSpacing - groupW) / 2;
        const tH = (d.tenants / maxVal) * (H - 20);
        const lH = (d.landlords / maxVal) * (H - 20);
        return (
          <g key={d.month}>
            <rect x={x} y={H - tH + 10} width={barW} height={tH} rx="3" fill="url(#tenantGrad)" />
            <rect x={x + barW + gap} y={H - lH + 10} width={barW} height={lH} rx="3" fill="url(#landlordGrad)" />
            <text x={x + groupW / 2} y={H + 26} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RevenueChart({ data }: { data: AdminStats["daily_revenue"] }) {
  const maxVal = Math.max(...data.map((d) => d.amount));
  const W = 400, H = 120, pad = 32;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - 10 - (d.amount / maxVal) * (H - 30);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `${pad},${H - 10} ${polyline} ${W - pad},${H - 10}`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#revGrad)" />
      <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - 10 - (d.amount / maxVal) * (H - 30);
        return (
          <g key={d.date}>
            <circle cx={x} cy={y} r="3" fill="#10b981" />
            <text x={x} y={H + 20} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.date}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }: { data: AdminStats["property_types"] }) {
  const total = data.reduce((a, b) => a + b.count, 0);
  const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5"];
  let cumAngle = -Math.PI / 2;
  const cx = 70, cy = 70, r = 55, ir = 32;

  const slices = data.map((d, i) => {
    const angle = (d.count / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const ix1 = cx + ir * Math.cos(cumAngle);
    const iy1 = cy + ir * Math.sin(cumAngle);
    const ix2 = cx + ir * Math.cos(cumAngle + angle);
    const iy2 = cy + ir * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
    cumAngle += angle;
    return { path, color: colors[i % colors.length], label: d.type, count: d.count };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="w-32 h-32 flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        <text x="70" y="66" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{total}</text>
        <text x="70" y="80" textAnchor="middle" fontSize="8" fill="#94a3b8">properties</text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-slate-400 truncate flex-1">{s.label}</span>
            <span className="text-white font-medium">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color, alert,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; alert?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border ${alert ? "border-red-300 dark:border-red-800" : "border-slate-200 dark:border-slate-800"} shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOverviewClient() {
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

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Platform Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Real-time platform health and key metrics
        </p>
      </div>

      {/* Alert banner if issues */}
      {(stats.fraud_alerts > 0 || stats.open_reports > 0) && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-red-700 dark:text-red-400">Attention required: </span>
            <span className="text-red-600 dark:text-red-300">
              {stats.fraud_alerts} active fraud alert{stats.fraud_alerts !== 1 ? "s" : ""} and{" "}
              {stats.open_reports} open report{stats.open_reports !== 1 ? "s" : ""} need review.
            </span>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users" value={fmt(stats.total_users)}
          sub={`+${stats.new_users_today} today`}
          icon={Users} color="bg-indigo-500"
        />
        <StatCard
          label="Total Properties" value={fmt(stats.total_properties)}
          sub={`${stats.pending_approvals} pending approval`}
          icon={Building2} color="bg-violet-500"
        />
        <StatCard
          label="Monthly Revenue" value={`KES ${fmt(stats.revenue_this_month)}`}
          sub={`KES ${fmt(stats.total_revenue)} all time`}
          icon={DollarSign} color="bg-emerald-500"
        />
        <StatCard
          label="Fraud Alerts" value={stats.fraud_alerts}
          sub={`${stats.open_reports} open reports`}
          icon={ShieldAlert} color="bg-red-500"
          alert={stats.fraud_alerts > 0}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Landlords", value: stats.total_landlords, icon: Building2, color: "text-indigo-400" },
          { label: "Tenants", value: stats.total_tenants, icon: Users, color: "text-violet-400" },
          { label: "Pending Verifications", value: stats.pending_verifications, icon: Clock, color: "text-amber-400" },
          { label: "New This Week", value: stats.new_users_week, icon: TrendingUp, color: "text-emerald-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
          >
            <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
            <div>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{item.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User signups chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Monthly Signups</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tenants vs Landlords</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span className="text-slate-400">Tenants</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-400" />
                <span className="text-slate-400">Landlords</span>
              </span>
            </div>
          </div>
          <GroupedBarChart data={stats.monthly_signups} />
        </div>

        {/* Property type donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Property Types</h2>
          <p className="text-xs text-slate-400 mb-4">Distribution by category</p>
          <DonutChart data={stats.property_types} />
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Weekly Revenue</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daily earnings this week (KES)</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>KES {fmt(stats.revenue_this_month)} this month</span>
          </div>
        </div>
        <RevenueChart data={stats.daily_revenue} />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Approvals", value: stats.pending_approvals, href: "/admin/properties", color: "from-amber-500 to-orange-500" },
          { label: "Pending Verifications", value: stats.pending_verifications, href: "/admin/verifications", color: "from-indigo-500 to-violet-500" },
          { label: "Open Reports", value: stats.open_reports, href: "/admin/reports", color: "from-red-500 to-pink-500" },
          { label: "Fraud Alerts", value: stats.fraud_alerts, href: "/admin/fraud", color: "from-orange-500 to-red-500" },
        ].map((q) => (
          <a
            key={q.label}
            href={q.href}
            className={`bg-gradient-to-br ${q.color} rounded-2xl p-4 text-white group hover:scale-[1.02] transition-transform`}
          >
            <p className="text-3xl font-black mb-1">{q.value}</p>
            <p className="text-xs opacity-90">{q.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
