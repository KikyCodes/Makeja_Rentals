"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Copy,
  ImageOff,
  DollarSign,
  Fingerprint,
  MailWarning,
} from "lucide-react";
import type { FraudAlert } from "@/types";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_STYLES: Record<string, { chip: string; bar: string; glow: string }> = {
  low: { chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", bar: "bg-slate-400", glow: "" },
  medium: { chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", bar: "bg-amber-400", glow: "" },
  high: { chip: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400", bar: "bg-orange-400", glow: "" },
  critical: { chip: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400", bar: "bg-red-500", glow: "ring-2 ring-red-500/30" },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  duplicate_listing: { label: "Duplicate Listing", icon: Copy, color: "text-amber-500" },
  fake_images: { label: "Fake Images", icon: ImageOff, color: "text-orange-500" },
  price_manipulation: { label: "Price Manipulation", icon: DollarSign, color: "text-violet-500" },
  identity_fraud: { label: "Identity Fraud", icon: Fingerprint, color: "text-red-500" },
  spam: { label: "Spam", icon: MailWarning, color: "text-blue-500" },
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function FraudCard({
  alert,
  onResolve,
}: {
  alert: FraudAlert;
  onResolve: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const severity = SEVERITY_STYLES[alert.severity];
  const typeConfig = TYPE_CONFIG[alert.type];
  const TypeIcon = typeConfig?.icon ?? ShieldAlert;

  const handleResolve = async () => {
    setLoading(true);
    await onResolve(alert.id);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${severity.glow} ${alert.is_resolved ? "opacity-60" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.is_resolved ? "bg-slate-100 dark:bg-slate-800" : "bg-red-50 dark:bg-red-950/30"}`}>
            <TypeIcon className={`w-4 h-4 ${alert.is_resolved ? "text-slate-400" : typeConfig?.color ?? "text-red-500"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {typeConfig?.label ?? alert.type}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${severity.chip}`}>
                {alert.severity}
              </span>
              {alert.is_resolved && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Resolved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {alert.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <User className="w-3 h-3" />
                <span>{alert.user.full_name ?? alert.user.email}</span>
              </div>
              {alert.property && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{alert.property.title}</span>
                </div>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Severity bar */}
        <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${severity.bar}`}
            style={{
              width: alert.severity === "critical" ? "100%" : alert.severity === "high" ? "75%" : alert.severity === "medium" ? "50%" : "25%",
            }}
          />
        </div>
      </div>

      {/* Expandable evidence */}
      {alert.evidence.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {expanded ? "Hide" : "Show"} evidence ({alert.evidence.length} items)
          </button>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              className="px-4 pb-4 space-y-1.5"
            >
              {alert.evidence.map((e, i) => (
                <div key={i} className="text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 font-mono">
                  {e}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      {!alert.is_resolved && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex gap-2">
          <a
            href={`/admin/users?q=${encodeURIComponent(alert.user.email)}`}
            className="flex-1 text-center py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
          >
            View User
          </a>
          <button
            onClick={handleResolve}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Resolved
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function FraudClient() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(() => {
    const resolved = showResolved ? "" : "false";
    fetch(`/api/admin/fraud?resolved=${resolved}`)
      .then((r) => r.json())
      .then(({ data }) => {
        const sorted = [...(data as FraudAlert[])].sort(
          (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        );
        setAlerts(sorted);
        setLoading(false);
      });
  }, [showResolved]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleResolve = async (id: string) => {
    await fetch("/api/admin/fraud", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_resolved: true }),
    });
    fetchAlerts();
  };

  const activeAlerts = alerts.filter((a) => !a.is_resolved);
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Fraud Detection</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            AI-detected fraud signals and manual flags
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-xl text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            {criticalCount} CRITICAL
          </div>
        )}
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Active", value: activeAlerts.length, color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
          { label: "Critical", value: alerts.filter((a) => a.severity === "critical" && !a.is_resolved).length, color: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold" },
          { label: "High", value: alerts.filter((a) => a.severity === "high" && !a.is_resolved).length, color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" },
          { label: "Medium", value: alerts.filter((a) => a.severity === "medium" && !a.is_resolved).length, color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
        ].map((c) => (
          <div key={c.label} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${c.color}`}>
            {c.value} {c.label}
          </div>
        ))}
        <button
          onClick={() => setShowResolved((v) => !v)}
          className="px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {showResolved ? "Hide" : "Show"} resolved
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No fraud alerts</p>
          <p className="text-xs text-slate-400 mt-1">The platform is clean — no active fraud signals detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <FraudCard key={alert.id} alert={alert} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}
