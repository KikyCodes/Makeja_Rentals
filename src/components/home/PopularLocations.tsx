"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";

const LOCATIONS = [
  { name: "Machakos Town",   count: 180, emoji: "🏙️", desc: "City center · Near MKU campus" },
  { name: "Athi River",      count: 95,  emoji: "🏭", desc: "Industrial hub · EPZ workers" },
  { name: "Mlolongo",        count: 60,  emoji: "🌆", desc: "Nairobi corridor · Affordable" },
  { name: "Syokimau",        count: 55,  emoji: "🚆", desc: "Commuter town · SGR station" },
  { name: "Katani",          count: 40,  emoji: "🌳", desc: "Serene suburb · Growing fast" },
  { name: "Mavoko",          count: 35,  emoji: "🏘️", desc: "Family estates · Quiet" },
  { name: "Kangundo",        count: 28,  emoji: "🌄", desc: "Upcountry budget living" },
  { name: "Mutituni",        count: 22,  emoji: "📚", desc: "Student belt · Near campus" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

export default function PopularLocations() {
  return (
    <section className="section-padding bg-[var(--background-muted)]">
      <div className="container-site">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-overline text-green-600 mb-3"
            >
              Explore Areas
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-display-md text-[var(--foreground)]"
            >
              Popular Locations
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-[var(--foreground-muted)] max-w-md"
            >
              Browse rentals by area across Machakos County
            </motion.p>
          </div>
          <Link href="/listings" className="btn btn-ghost btn-sm text-green-600 hover:text-green-700 shrink-0">
            <MapPin className="w-4 h-4" /> View map
          </Link>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {LOCATIONS.map((loc) => (
            <motion.div key={loc.name} variants={item}>
              <Link
                href={`/listings?area=${encodeURIComponent(loc.name)}`}
                className="group relative flex flex-col p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-green-500/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-200 focus-ring overflow-hidden"
              >
                {/* bg emoji decoration */}
                <span className="absolute -bottom-2 -right-2 text-6xl opacity-10 select-none pointer-events-none group-hover:opacity-20 transition-opacity">
                  {loc.emoji}
                </span>

                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{loc.emoji}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--foreground-subtle)] group-hover:text-green-600 transition-colors" />
                </div>
                <p className="font-bold text-[var(--foreground)] group-hover:text-green-600 transition-colors text-sm leading-tight mb-1">
                  {loc.name}
                </p>
                <p className="text-[10px] text-[var(--foreground-subtle)] mb-3 leading-tight">
                  {loc.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full w-fit">
                  <MapPin className="w-2.5 h-2.5" />
                  {loc.count} listings
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
