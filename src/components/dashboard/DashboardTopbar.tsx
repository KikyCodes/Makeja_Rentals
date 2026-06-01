"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, X, Home, LayoutDashboard, PlusCircle, MessageSquare, CalendarCheck, BarChart2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard":              "Overview",
  "/dashboard/listings":     "My Listings",
  "/dashboard/add":          "Add Property",
  "/dashboard/inquiries":    "Inquiries",
  "/dashboard/messages":     "Messages",
  "/dashboard/bookings":     "Bookings",
  "/dashboard/analytics":    "Analytics",
  "/dashboard/verification": "Verification",
  "/dashboard/settings":     "Settings",
};

const MOBILE_NAV = [
  { href: "/dashboard",              label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/listings",     label: "Listings",    icon: Home },
  { href: "/dashboard/add",          label: "Add",         icon: PlusCircle },
  { href: "/dashboard/inquiries",    label: "Inquiries",   icon: MessageSquare },
  { href: "/dashboard/bookings",     label: "Bookings",    icon: CalendarCheck },
  { href: "/dashboard/analytics",    label: "Analytics",   icon: BarChart2 },
  { href: "/dashboard/verification", label: "Verify",      icon: ShieldCheck },
];

interface Props {
  sidebarWidth: number;
}

export default function DashboardTopbar({ sidebarWidth }: Props) {
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const pageTitle = BREADCRUMBS[pathname] ?? "Dashboard";
  const unread = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch("/api/dashboard/notifications")
      .then((r) => r.json())
      .then(({ data }) => setNotifications(data));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/dashboard/notifications", { method: "PATCH", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await fetch("/api/dashboard/notifications", { method: "PATCH", body: JSON.stringify({ id: "all" }), headers: { "Content-Type": "application/json" } });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 h-16 z-20 flex items-center px-4 sm:px-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-sm"
        style={{ left: sidebarWidth }}
      >
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden mr-3 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Dashboard</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">{pageTitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs((v) => !v)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-white text-sm">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-green-600 hover:underline font-medium">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">No notifications</div>
                    ) : notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { markRead(n.id); setShowNotifs(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${!n.is_read ? "bg-green-50/50 dark:bg-green-950/20" : ""}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {!n.is_read && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />}
                          {n.is_read && <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />}
                          <div>
                            <p className={`text-sm font-semibold ${!n.is_read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0a1a0f] shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-green-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-white text-sm">
                    Makeja<span className="text-green-400">Rentals</span>
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-green-400/60 hover:text-green-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {MOBILE_NAV.map((item) => {
                  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-green-600 text-white" : "text-green-200/60 hover:text-green-100 hover:bg-green-900/30"}`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
