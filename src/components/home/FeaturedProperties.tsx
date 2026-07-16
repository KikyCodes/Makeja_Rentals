"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame, Clock, DollarSign } from "lucide-react";
import PropertyCard from "@/components/listings/PropertyCard";
import type { Property } from "@/types";

const ALL_PROPERTIES: Property[] = [
  {
    id: "1",
    landlord_id: "l1",
    title: "Modern Bedsitter Near Machakos University",
    description: "Clean, spacious bedsitter with WiFi and 24hr water",
    type: "bedsitter",
    price: 5500,
    price_period: "per_month",
    location: "Gate B Road, Machakos",
    area: "Machakos Town",
    latitude: -1.5177,
    longitude: 37.2634,
    bedrooms: 0,
    bathrooms: 1,
    max_occupants: 2,
    furnishing: "semi_furnished",
    amenities: ["WiFi", "Water 24/7", "Security Guard"],
    rules: ["No smoking", "No loud music after 10pm"],
    is_available: true,
    is_verified: true,
    is_featured: true,
    views_count: 243, distance_from_campus: 0.3, gender_preference: "any",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i1", property_id: "1", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", is_primary: true, sort_order: 0 }],
  },
  {
    id: "2",
    landlord_id: "l2",
    title: "Cosy Hostel Room — All Inclusive",
    description: "Clean hostel with study hall, laundry, and backup power",
    type: "hostel",
    price: 3500,
    price_period: "per_month",
    location: "Kenyatta Avenue, Machakos",
    area: "Machakos Town",
    latitude: -1.52,
    longitude: 37.27,
    bedrooms: 0,
    bathrooms: 1,
    max_occupants: 4,
    furnishing: "furnished",
    amenities: ["WiFi", "Laundry", "Study Room", "Backup Power"],
    rules: [],
    is_available: true,
    is_verified: true,
    is_featured: true,
    views_count: 189, distance_from_campus: 0.5, gender_preference: "any",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i2", property_id: "2", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", is_primary: true, sort_order: 0 }],
  },
  {
    id: "3",
    landlord_id: "l3",
    title: "Spacious 1-Bedroom Apartment",
    description: "Perfect for young professionals, with parking and balcony",
    type: "one_bedroom",
    price: 12000,
    price_period: "per_month",
    location: "Stadium Road, Machakos",
    area: "Machakos Town",
    latitude: -1.515,
    longitude: 37.26,
    bedrooms: 1,
    bathrooms: 1,
    max_occupants: 2,
    furnishing: "semi_furnished",
    amenities: ["Parking", "Balcony", "Water 24/7", "Security Guard"],
    rules: ["No pets"],
    is_available: true,
    is_verified: false,
    is_featured: true,
    views_count: 312, distance_from_campus: 1.2, gender_preference: "any",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i3", property_id: "3", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", is_primary: true, sort_order: 0 }],
  },
  {
    id: "4",
    landlord_id: "l4",
    title: "Studio Apartment — Athi River",
    description: "Modern studio with gym access and swimming pool",
    type: "studio",
    price: 18000,
    price_period: "per_month",
    location: "Industrial Area, Athi River",
    area: "Athi River",
    latitude: -1.46,
    longitude: 36.98,
    bedrooms: 0,
    bathrooms: 1,
    max_occupants: 2,
    furnishing: "furnished",
    amenities: ["Gym", "Swimming Pool", "WiFi", "Parking", "CCTV"],
    rules: [],
    is_available: true,
    is_verified: true,
    is_featured: false,
    views_count: 98, distance_from_campus: 5.0, gender_preference: "any",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i4", property_id: "4", url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", is_primary: true, sort_order: 0 }],
  },
  {
    id: "5",
    landlord_id: "l5",
    title: "Budget Shared Room — Near Campus",
    description: "Affordable shared accommodation 5 minutes from campus gate",
    type: "shared_room",
    price: 2500,
    price_period: "per_month",
    location: "University Road, Machakos",
    area: "Machakos Town",
    latitude: -1.519,
    longitude: 37.265,
    bedrooms: 0,
    bathrooms: 1,
    max_occupants: 3,
    furnishing: "furnished",
    amenities: ["WiFi", "Water 24/7", "Near Campus"],
    rules: ["No alcohol", "Curfew at 11pm"],
    is_available: true,
    is_verified: true,
    is_featured: false,
    views_count: 421, distance_from_campus: 0.1, gender_preference: "male",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i5", property_id: "5", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", is_primary: true, sort_order: 0 }],
  },
  {
    id: "6",
    landlord_id: "l6",
    title: "2-Bedroom Family Apartment",
    description: "Ideal for couples or roommates. Garden, parking included",
    type: "two_bedroom",
    price: 22000,
    price_period: "per_month",
    location: "Muvuti Area, Machakos",
    area: "Machakos Town",
    latitude: -1.524,
    longitude: 37.27,
    bedrooms: 2,
    bathrooms: 2,
    max_occupants: 4,
    furnishing: "semi_furnished",
    amenities: ["Parking", "Garden", "Water 24/7", "CCTV"],
    rules: ["No smoking indoors"],
    is_available: true,
    is_verified: false,
    is_featured: false,
    views_count: 167, distance_from_campus: 2.0, gender_preference: "any",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ id: "i6", property_id: "6", url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", is_primary: true, sort_order: 0 }],
  },
];

const TABS = [
  { id: "featured", label: "Featured", icon: Flame, filter: (p: Property) => p.is_featured },
  { id: "newest",   label: "Newest",   icon: Clock,  filter: (_: Property, i: number) => i < 4 },
  { id: "budget",   label: "Budget",   icon: DollarSign, filter: (p: Property) => p.price <= 6000 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function FeaturedProperties() {
  const [activeTab, setActiveTab] = useState("featured");
  const tab = TABS.find((t) => t.id === activeTab)!;
  const properties = ALL_PROPERTIES.filter((p, i) => tab.filter(p, i));

  return (
    <section className="section-padding bg-[var(--background)]">
      <div className="container-site">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-overline text-green-600 mb-3"
            >
              Listings
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-display-md text-[var(--foreground)]"
            >
              Top Listings
            </motion.h2>
          </div>

          <Link
            href="/listings"
            className="btn btn-outline-green btn-sm group shrink-0"
          >
            View All Listings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? "bg-green-600 text-white shadow-lg shadow-green-900/25"
                  : "bg-[var(--muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map((property, i) => (
              <motion.div key={property.id} variants={item}>
                <PropertyCard property={property} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {properties.length === 0 && (
          <div className="text-center py-16 text-[var(--foreground-muted)]">
            No listings in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
