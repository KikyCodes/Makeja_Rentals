"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, BedDouble, Home, Layers, Users, Hotel } from "lucide-react";

const CATEGORIES = [
  {
    icon: Hotel,
    label: "Hostels",
    value: "hostel",
    count: "180+",
    desc: "Shared living, great for students",
    color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    ring: "hover:ring-blue-300 dark:hover:ring-blue-700",
    badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",
  },
  {
    icon: BedDouble,
    label: "Bedsitters",
    value: "bedsitter",
    count: "120+",
    desc: "Self-contained, affordable privacy",
    color: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400",
    ring: "hover:ring-green-300 dark:hover:ring-green-700",
    badge: "bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300",
  },
  {
    icon: Home,
    label: "1-Bedroom",
    value: "one_bedroom",
    count: "90+",
    desc: "Perfect for couples & professionals",
    color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    ring: "hover:ring-purple-300 dark:hover:ring-purple-700",
    badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300",
  },
  {
    icon: Building2,
    label: "2-Bedroom",
    value: "two_bedroom",
    count: "60+",
    desc: "Spacious family-sized apartments",
    color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    ring: "hover:ring-amber-300 dark:hover:ring-amber-700",
    badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
  },
  {
    icon: Layers,
    label: "Studios",
    value: "studio",
    count: "45+",
    desc: "Modern open-plan living",
    color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    ring: "hover:ring-rose-300 dark:hover:ring-rose-700",
    badge: "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300",
  },
  {
    icon: Users,
    label: "Shared Rooms",
    value: "shared_room",
    count: "35+",
    desc: "Budget-friendly room-sharing",
    color: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
    ring: "hover:ring-teal-300 dark:hover:ring-teal-700",
    badge: "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CategoriesSection() {
  return (
    <section className="section-padding bg-[var(--background-muted)]">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-overline text-green-600 mb-3"
          >
            Property Types
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-md text-[var(--foreground)]"
          >
            Browse by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-[var(--foreground-muted)] max-w-md mx-auto"
          >
            From student hostels to modern studios — find the type that fits your lifestyle and budget.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.value} variants={item}>
              <Link
                href={`/listings?type=${cat.value}`}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] ring-2 ring-transparent transition-all duration-200 ${cat.ring} hover:shadow-[var(--shadow-md)] hover:-translate-y-1 focus-ring`}
              >
                <div className={`w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-green-600 transition-colors leading-tight mb-1">
                  {cat.label}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
                  {cat.count}
                </span>
                <p className="text-[10px] text-[var(--foreground-subtle)] mt-2 leading-tight hidden sm:block">
                  {cat.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
