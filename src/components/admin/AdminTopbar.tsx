"use client";

import { usePathname } from "next/navigation";
import { Shield, Bell } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Overview",
  "/admin/users": "User Management",
  "/admin/properties": "Property Approval",
  "/admin/verifications": "Verifications",
  "/admin/content": "Content Moderation",
  "/admin/reports": "Reports",
  "/admin/fraud": "Fraud Detection",
  "/admin/analytics": "Analytics",
  "/admin/revenue": "Revenue",
};

interface Props {
  sidebarWidth: number;
}

export default function AdminTopbar({ sidebarWidth }: Props) {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Admin";

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <Shield className="w-4 h-4" />
          <span className="font-semibold">Admin</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="font-bold text-slate-900 dark:text-white">{pageLabel}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Platform health indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </div>

        {/* Notifications bell */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
