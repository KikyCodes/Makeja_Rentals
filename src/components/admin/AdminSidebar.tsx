"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  BadgeCheck,
  BarChart3,
  FileText,
  DollarSign,
  ShieldAlert,
  Flag,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  badges?: Record<string, number>;
}

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { href: "/admin/users", label: "Users", icon: Users, badge: "users" },
  { href: "/admin/properties", label: "Property Approval", icon: Building2, badge: "properties" },
  { href: "/admin/verifications", label: "Verifications", icon: BadgeCheck, badge: "verifications" },
  { href: "/admin/content", label: "Content Moderation", icon: Flag, badge: "content" },
  { href: "/admin/reports", label: "Reports", icon: FileText, badge: "reports" },
  { href: "/admin/fraud", label: "Fraud Detection", icon: ShieldAlert, badge: "fraud" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
];

export default function AdminSidebar({ collapsed, onToggle, badges = {} }: Props) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const isActive = (href: string, end?: boolean) => {
    if (end) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="font-black text-white text-sm leading-tight whitespace-nowrap">
                Makeja
              </p>
              <p className="text-indigo-300 text-xs font-medium whitespace-nowrap">
                Admin Console
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin">
        {NAV.map((item) => {
          const active = isActive(item.href, item.end);
          const badge = item.badge ? (badges[item.badge] ?? 0) : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                relative flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:bg-white/8 hover:text-white"
                }
              `}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.13 }}
                    className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {badge > 0 && (
                <AnimatePresence>
                  {collapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                      {badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs text-white font-medium truncate">
                  {user?.email ?? "Admin"}
                </p>
                <p className="text-[10px] text-indigo-300 truncate">Super Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
