"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Eye, Heart, MessageCircle, TrendingUp,
  Home, CheckCircle, Clock, MoreVertical, Edit, Trash2,
} from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import type { Property } from "@/types";

const MOCK_LISTINGS: Property[] = [
  {
    id: "1", landlord_id: "l1",
    title: "Modern Bedsitter Near University",
    description: "", type: "bedsitter",
    price: 5500, price_period: "per_month",
    location: "Gate B Road, Machakos", area: "Machakos Town",
    latitude: -1.5177, longitude: 37.2634,
    bedrooms: 0, bathrooms: 1, max_occupants: 2,
    furnishing: "semi_furnished",
    amenities: ["WiFi", "Water 24/7"], rules: [],
    is_available: true, is_verified: true, is_featured: true, views_count: 243,
    distance_from_campus: 0.3, gender_preference: "any",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    images: [{ id: "i1", property_id: "1", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400", is_primary: true, order: 0 }],
  },
  {
    id: "2", landlord_id: "l1",
    title: "2-Bedroom Apartment — Muvuti",
    description: "", type: "two_bedroom",
    price: 22000, price_period: "per_month",
    location: "Muvuti Area, Machakos", area: "Machakos Town",
    latitude: -1.524, longitude: 37.27,
    bedrooms: 2, bathrooms: 2, max_occupants: 4,
    furnishing: "semi_furnished",
    amenities: ["Parking", "Garden"], rules: [],
    is_available: false, is_verified: false, is_featured: false, views_count: 67,
    distance_from_campus: 2.0, gender_preference: "any",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    images: [],
  },
];

const stats = [
  { label: "Total Listings", value: "2", icon: Home, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { label: "Total Views", value: "310", icon: Eye, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  { label: "Inquiries", value: "18", icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  { label: "Saved by Users", value: "42", icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
];

export default function DashboardClient() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Landlord Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your listings and track performance</p>
          </div>
          <Link
            href="/dashboard/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white">Your Listings</h2>
          </div>

          {MOCK_LISTINGS.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🏠</p>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">No listings yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Add your first property to start attracting tenants.</p>
              <Link href="/dashboard/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl text-sm">
                <Plus className="w-4 h-4" /> Add First Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_LISTINGS.map((listing) => (
                <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {listing.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatPropertyType(listing.type)} · {listing.area}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatPrice(listing.price)}</p>
                      <p className="text-xs text-slate-400">/month</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 dark:text-white">{listing.views_count}</p>
                      <p className="text-xs text-slate-400">Views</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {listing.is_available ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                        <Clock className="w-3 h-3" /> Rented
                      </span>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === listing.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-10">
                          <Link href={`/listings/${listing.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Eye className="w-4 h-4" /> View
                          </Link>
                          <Link href={`/dashboard/edit/${listing.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Edit className="w-4 h-4" /> Edit
                          </Link>
                          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
