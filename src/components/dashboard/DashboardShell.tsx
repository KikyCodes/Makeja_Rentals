"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import type { DashboardStats } from "@/types";

interface Props {
  children: React.ReactNode;
  stats?: DashboardStats;
}

export default function DashboardShell({ children, stats }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 240;

  const badges: Record<string, number> = stats
    ? { new_inquiries: stats.new_inquiries, pending_bookings: stats.pending_bookings }
    : {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        badges={badges}
      />
      <DashboardTopbar sidebarWidth={sidebarWidth} />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
