"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Home, ShieldCheck, AlertTriangle, TrendingUp,
  Eye, CheckCircle, XCircle, Clock, BarChart3
} from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";

const STATS = [
  { label: "Total Users", value: "1,248", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { label: "Active Listings", value: "543", change: "+8%", icon: Home, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  { label: "Verified Properties", value: "321", change: "+5%", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  { label: "Pending Review", value: "24", change: "-3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
];

const PENDING = [
  { id: "p1", title: "Bedsitter — Gate B Road", landlord: "John Mwangi", area: "Machakos Town", price: 5500, type: "bedsitter" },
  { id: "p2", title: "Hostel Room — Kenyatta Ave", landlord: "Mary Kamau", area: "Machakos Town", price: 3200, type: "hostel" },
  { id: "p3", title: "2-Bedroom Apartment — Muvuti", landlord: "Peter Otieno", area: "Machakos Town", price: 22000, type: "two_bedroom" },
];

type Tab = "overview" | "pending" | "users" | "reports";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3 h-3" /> Admin Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage listings, users, and platform health</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-8 w-fit">
          {(["overview", "pending", "users", "reports"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className={`text-xs font-semibold mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>{stat.change} this month</p>
                </motion.div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> Platform Activity
              </h2>
              <div className="space-y-3">
                {[
                  { event: "New listing submitted for review", time: "5 min ago", type: "listing" },
                  { event: "User John Mwangi verified as landlord", time: "1 hour ago", type: "verify" },
                  { event: "Report filed on listing #A123", time: "2 hours ago", type: "alert" },
                  { event: "Listing approved: Modern Bedsitter, Machakos Town", time: "3 hours ago", type: "approve" },
                  { event: "New user registration: 15 today", time: "Today", type: "users" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === "alert" ? "bg-red-500" : item.type === "approve" ? "bg-green-500" : "bg-blue-500"}`} />
                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{item.event}</p>
                    <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Review */}
        {tab === "pending" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-slate-900 dark:text-white">Pending Approval ({PENDING.length})</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {PENDING.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatPropertyType(item.type)} · {item.area} · by {item.landlord}</p>
                  </div>
                  <span className="font-bold text-green-600 text-sm shrink-0">{formatPrice(item.price)}/mo</span>
                  <div className="flex gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Connect Supabase to load real user data.</p>
          </div>
        )}

        {tab === "reports" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Analytics coming soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
