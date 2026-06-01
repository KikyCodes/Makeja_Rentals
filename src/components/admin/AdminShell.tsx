"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface Props {
  children: React.ReactNode;
  badges?: Record<string, number>;
}

export default function AdminShell({ children, badges }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 256;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        badges={badges}
      />
      <AdminTopbar sidebarWidth={sidebarWidth} />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
