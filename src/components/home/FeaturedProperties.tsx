"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame, Clock, DollarSign, Loader2 } from "lucide-react";
import PropertyCard from "@/components/listings/PropertyCard";
import type { Property } from "@/types";

const TABS = [
  { id: "featured", label: "Featured", icon: Flame,       filter: (p: Property) => p.is_featured },
  { id: "newest",   label: "Newest",   icon: Clock,       filter: (_: Property, i: number) => i < 4 },
  { id: "budget",   label: "Budget",   icon: DollarSign,  filter: (p: Property) => p.price <= 6000 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function FeaturedProperties() {
  const [activeTab, setActiveTab] = useState("featured");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings?available=true&per_page=24&sort=newest")
      .then((r) => r.json())
      .then((json) => setProperties(json.data ?? []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const tab = TABS.find((t) => t.id === activeTab)!;
  const filtered = properties.filter((p, i) => tab.filter(p, i));

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

          <Link href="/listings" className="btn btn-outline-green btn-sm group shrink-0">
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
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((property, i) => (
                <motion.div key={property.id} variants={item}>
                  <PropertyCard property={property} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--foreground-muted)]">
            No listings in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
