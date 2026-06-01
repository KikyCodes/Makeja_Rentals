"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Home, PlusCircle, BarChart2, MessageSquare,
  CalendarCheck, ShieldCheck, LogOut, ChevronLeft, ChevronRight,
  Settings, Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",             label: "Overview",       icon: LayoutDashboard },
  { href: "/dashboard/listings",    label: "My Listings",    icon: Home },
  { href: "/dashboard/add",         label: "Add Property",   icon: PlusCircle,  accent: true },
  { href: "/dashboard/inquiries",   label: "Inquiries",      icon: MessageSquare, badge: "new_inquiries" },
  { href: "/dashboard/messages",    label: "Messages",       icon: MessageSquare },
  { href: "/dashboard/bookings",    label: "Bookings",       icon: CalendarCheck, badge: "pending_bookings" },
  { href: "/dashboard/analytics",   label: "Analytics",      icon: BarChart2 },
  { href: "/dashboard/verification",label: "Verification",   icon: ShieldCheck },
];

const BOTTOM_NAV = [
  { href: "/dashboard/settings",    label: "Settings",       icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  badges?: Record<string, number>;
}

export default function DashboardSidebar({ collapsed, onToggle, badges = {} }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-30 bg-[#0a1a0f] border-r border-green-950/60 shadow-xl overflow-hidden"
      style={{ minWidth: collapsed ? 72 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-green-950/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
          <Home className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 font-black text-white text-sm whitespace-nowrap overflow-hidden"
            >
              Makeja<span className="text-green-400">Rentals</span>
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md text-green-400/60 hover:text-green-400 hover:bg-green-900/40 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          const badgeCount = item.badge ? (badges[item.badge] ?? 0) : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-green-600 text-white shadow-lg shadow-green-900/40"
                  : item.accent
                  ? "text-green-400 hover:bg-green-900/40 border border-green-800/40 hover:border-green-700"
                  : "text-green-200/60 hover:text-green-100 hover:bg-green-900/30"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", item.accent && !isActive && "text-green-400")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden flex-1"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && badgeCount > 0 && (
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[20px] text-center">
                  {badgeCount}
                </span>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-green-950/60 py-3 px-2 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-200/60 hover:text-green-100 hover:bg-green-900/30 transition-all"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}

        <button
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Sign out</span>}
        </button>

        {/* User avatar strip */}
        <div className={cn("flex items-center gap-3 px-3 py-2 mt-1", collapsed && "justify-center")}>
          <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? "L"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-100 truncate">
                {user?.user_metadata?.full_name ?? "Landlord"}
              </p>
              <p className="text-xs text-green-400/60 truncate">{user?.email ?? ""}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
