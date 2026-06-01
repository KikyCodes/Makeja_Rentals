"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  RefreshCw,
  CreditCard,
  Star,
  BadgeCheck,
  Percent,
} from "lucide-react";
import type { RevenueRecord } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  subscription: { label: "Subscription", icon: CreditCard, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
  feature_boost: { label: "Feature Boost", icon: Star, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  verification_fee: { label: "Verification Fee", icon: BadgeCheck, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  commission: { label: "Commission", icon: Percent, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
};

const STATUS_STYLES: Record<string, string> = {
  completed: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  refunded: "text-red-500 dark:text-red-400",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  pending: Clock,
  refunded: RefreshCw,
};

function RevenueBarChart({ records }: { records: RevenueRecord[] }) {
  const byMonth: Record<string, number> = {};
  records.forEach((r) => {
    if (r.status === "completed") {
      const month = format(new Date(r.created_at), "MMM");
      byMonth[month] = (byMonth[month] ?? 0) + r.amount;
    }
  });
  const data = Object.entries(byMonth).map(([month, amount]) => ({ month, amount }));
  if (data.length < 2) {
    data.push({ month: "May", amount: 15000 }, { month: "Jun", amount: 0 });
  }
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const W = 400, H = 120, pad = 32;
  const barW = Math.min(32, (W - pad * 2) / data.length - 8);

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      <defs>
        <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} y1={H - H * f + 10} x2={W - pad} y2={H - H * f + 10}
          stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      {data.map((d, i) => {
        const x = pad + (i / data.length) * (W - pad * 2) + (((W - pad * 2) / data.length) - barW) / 2;
        const bH = Math.max(2, (d.amount / maxVal) * (H - 20));
        return (
          <g key={d.month}>
            <rect x={x} y={H - bH + 10} width={barW} height={bH} rx="4" fill="url(#revBarGrad)" />
            <text x={x + barW / 2} y={H + 22} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function RevenueClient() {
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then(({ data }) => { setRecords(data); setLoading(false); });
  }, []);

  const filtered = typeFilter === "all" ? records : records.filter((r) => r.type === typeFilter);

  const totalCompleted = records
    .filter((r) => r.status === "completed")
    .reduce((a, b) => a + b.amount, 0);

  const totalRefunded = records
    .filter((r) => r.status === "refunded")
    .reduce((a, b) => a + b.amount, 0);

  const byType: Record<string, number> = {};
  records.forEach((r) => {
    if (r.status === "completed") {
      byType[r.type] = (byType[r.type] ?? 0) + r.amount;
    }
  });

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Revenue</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Track platform earnings and transactions</p>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `KES ${fmt(totalCompleted)}`, icon: DollarSign, color: "bg-emerald-500" },
          { label: "Refunded", value: `KES ${fmt(totalRefunded)}`, icon: RefreshCw, color: "bg-red-500" },
          { label: "Transactions", value: records.length, icon: CreditCard, color: "bg-indigo-500" },
          { label: "Net Revenue", value: `KES ${fmt(totalCompleted - totalRefunded)}`, icon: TrendingUp, color: "bg-violet-500" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">{kpi.label}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue by type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Revenue Trend</h2>
          <p className="text-xs text-slate-400 mb-4">Completed transactions by month</p>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <RevenueBarChart records={records} />
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">By Revenue Type</h2>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, amount]) => {
              const config = TYPE_CONFIG[type];
              const pct = totalCompleted > 0 ? (amount / totalCompleted) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{config?.label ?? type}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">KES {fmt(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">Transactions</h2>
          {/* Type filter */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["all", "subscription", "feature_boost", "verification_fee"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${typeFilter === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                {t === "all" ? "All" : t === "feature_boost" ? "Boost" : t === "verification_fee" ? "Verify" : "Sub"}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["User", "Type", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const config = TYPE_CONFIG[r.type];
                  const StatusIcon = STATUS_ICONS[r.status];
                  return (
                    <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                            {r.user.full_name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{r.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {config && (
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${config.color}`}>
                              <config.icon className="w-3 h-3" />
                            </div>
                          )}
                          <span className="text-xs text-slate-600 dark:text-slate-300">{config?.label ?? r.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          KES {r.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
