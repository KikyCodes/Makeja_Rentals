"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Eye, Edit, Trash2, MoreVertical, CheckCircle2, Clock,
  Shield, ShieldOff, Search, SlidersHorizontal, Star,
} from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import type { Property } from "@/types";

export default function ListingsManager() {
  const [listings, setListings] = useState<Property[]>(
    MOCK_PROPERTIES.filter((p) => p.landlord_id === "l1" || ["1", "2", "3", "6"].includes(p.id))
  );
  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState<"all" | "available" | "rented">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = listings.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.area.toLowerCase().includes(search.toLowerCase());
    const matchAvail = filterAvail === "all" ? true : filterAvail === "available" ? l.is_available : !l.is_available;
    return matchSearch && matchAvail;
  });

  const toggleAvailability = (id: string) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_available: !l.is_available } : l));
    setOpenMenu(null);
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirm(null);
    setOpenMenu(null);
  };

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.is_available).length,
    verified: listings.filter((l) => l.is_verified).length,
    totalViews: listings.reduce((s, l) => s + l.views_count, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Listings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stats.total} properties · {stats.active} available</p>
        </div>
        <Link href="/dashboard/add" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-green-900/20">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,      color: "text-slate-700 dark:text-white",   bg: "bg-white dark:bg-slate-900" },
          { label: "Active",    value: stats.active,     color: "text-green-700 dark:text-green-400",bg: "bg-green-50 dark:bg-green-950/40" },
          { label: "Verified",  value: stats.verified,   color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Total Views",value: stats.totalViews.toLocaleString(), color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "available", "rented"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterAvail(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${filterAvail === f ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-green-400"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Listings table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-bold text-slate-700 dark:text-white mb-1">No listings found</p>
            <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Property</th>
                  <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Type</th>
                  <th className="text-right px-3 py-3 font-semibold">Price</th>
                  <th className="text-center px-3 py-3 font-semibold hidden md:table-cell">Views</th>
                  <th className="text-center px-3 py-3 font-semibold">Status</th>
                  <th className="text-center px-3 py-3 font-semibold hidden lg:table-cell">Verified</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {filtered.map((listing) => (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Thumbnail + title */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            {listing.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white truncate max-w-[180px]">{listing.title}</p>
                            <p className="text-xs text-slate-400 truncate">{listing.location}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {formatPropertyType(listing.type)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3 text-right">
                        <span className="font-bold text-green-600 text-sm">{formatPrice(listing.price)}</span>
                        <span className="text-xs text-slate-400 block">/mo</span>
                      </td>

                      {/* Views */}
                      <td className="px-3 py-3 text-center hidden md:table-cell">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{listing.views_count.toLocaleString()}</span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 text-center">
                        {listing.is_available ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                            <Clock className="w-3 h-3" />Rented
                          </span>
                        )}
                      </td>

                      {/* Verified */}
                      <td className="px-3 py-3 text-center hidden lg:table-cell">
                        {listing.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5" />Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <ShieldOff className="w-3.5 h-3.5" />Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {openMenu === listing.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-20"
                              >
                                <Link href={`/listings/${listing.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <Eye className="w-4 h-4" />View listing
                                </Link>
                                <Link href={`/dashboard/edit/${listing.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  <Edit className="w-4 h-4" />Edit
                                </Link>
                                <button onClick={() => toggleAvailability(listing.id)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark as {listing.is_available ? "Rented" : "Available"}
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                <button onClick={() => { setDeleteConfirm(listing.id); setOpenMenu(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left">
                                  <Trash2 className="w-4 h-4" />Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-center font-black text-slate-900 dark:text-white mb-1">Delete listing?</h3>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">This action cannot be undone. The listing will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={() => deleteListing(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
