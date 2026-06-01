"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import PropertyCard from "@/components/listings/PropertyCard";
import type { Property } from "@/types";

// Mock saved — replace with Supabase favorites query
const MOCK_SAVED: Property[] = [
  {
    id: "1", landlord_id: "l1",
    title: "Modern Bedsitter Near Machakos University",
    description: "Clean, spacious bedsitter with WiFi and 24hr water",
    type: "bedsitter", price: 5500, price_period: "per_month",
    location: "Gate B Road, Machakos", area: "Machakos Town",
    latitude: -1.5177, longitude: 37.2634,
    bedrooms: 0, bathrooms: 1, max_occupants: 2,
    furnishing: "semi_furnished",
    amenities: ["WiFi", "Water 24/7", "Security Guard"], rules: [],
    is_available: true, is_verified: true, is_featured: true, views_count: 243,
    distance_from_campus: 0.3, gender_preference: "any",
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    is_favorited: true,
    images: [{ id: "i1", property_id: "1", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", is_primary: true, order: 0 }],
  },
];

export default function SavedClient() {
  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Saved Properties</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{MOCK_SAVED.length} saved</p>
          </div>
        </div>

        {MOCK_SAVED.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No saved properties yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Heart any listing to save it here for later.</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Browse Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {MOCK_SAVED.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
