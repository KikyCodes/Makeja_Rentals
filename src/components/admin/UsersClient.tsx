"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MoreVertical,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Eye,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { AdminUser } from "@/types";
import { formatDistanceToNow } from "date-fns";

const ROLE_TABS = [
  { key: "all", label: "All" },
  { key: "tenant", label: "Tenants" },
  { key: "landlord", label: "Landlords" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  suspended: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  banned: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  active: CheckCircle2,
  suspended: Clock,
  banned: XCircle,
};

function UserRow({
  user,
  onStatusChange,
}: {
  user: AdminUser;
  onStatusChange: (id: string, status: AdminUser["status"]) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const StatusIcon = STATUS_ICONS[user.status];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold flex-shrink-0">
            {user.full_name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
              {user.full_name ?? "—"}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
          </div>
          {user.flags > 0 && (
            <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {user.flags} flags
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${user.role === "landlord" ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"}`}>
          {user.role === "landlord" ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
          {user.role}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[user.status]}`}>
          <StatusIcon className="w-3 h-3" />
          {user.status}
        </span>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {user.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
          <span>{user.listings_count} listings</span>
        </div>
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className="text-xs text-slate-400">
          {user.last_sign_in
            ? formatDistanceToNow(new Date(user.last_sign_in), { addSuffix: true })
            : "Never"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 z-20 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Eye className="w-4 h-4" /> View Profile
                  </button>
                  {user.status !== "active" && (
                    <button
                      onClick={() => { onStatusChange(user.id, "active"); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <ShieldCheck className="w-4 h-4" /> Activate
                    </button>
                  )}
                  {user.status !== "suspended" && (
                    <button
                      onClick={() => { onStatusChange(user.id, "suspended"); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                      <Clock className="w-4 h-4" /> Suspend
                    </button>
                  )}
                  {user.status !== "banned" && (
                    <button
                      onClick={() => { onStatusChange(user.id, "banned"); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <ShieldBan className="w-4 h-4" /> Ban User
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-slate-100 dark:border-slate-700"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}

export default function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("all");
  const [q, setQ] = useState("");

  const fetchUsers = useCallback(() => {
    const params = new URLSearchParams({ role, ...(q && { q }) });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then(({ data }) => { setUsers(data); setLoading(false); });
  }, [role, q]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (id: string, status: AdminUser["status"]) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchUsers();
  };

  const counts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    banned: users.filter((u) => u.status === "banned").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage all platform users</p>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: counts.all, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400" },
          { label: "Active", value: counts.active, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
          { label: "Suspended", value: counts.suspended, color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
          { label: "Banned", value: counts.banned, color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
        ].map((c) => (
          <div key={c.label} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${c.color}`}>
            {c.value} {c.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          {/* Role tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {ROLE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setRole(t.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${role === t.key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["User", "Role", "Status", "Activity", "Last Active", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === "Role" ? "hidden sm:table-cell" : ""} ${h === "Activity" ? "hidden md:table-cell" : ""} ${h === "Last Active" ? "hidden lg:table-cell" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <UserRow key={u.id} user={u} onStatusChange={handleStatusChange} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
