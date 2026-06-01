"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Grace Mwende",
    role: "MKU Student",
    location: "Machakos Town",
    avatar: "GM",
    gradient: "from-pink-400 to-rose-500",
    rating: 5,
    text: "I found my hostel within 2 days of joining Makeja Rentals. The verified badge gave me confidence to contact the landlord directly. Saved me so much time and stress!",
    highlight: "Found hostel in 2 days",
  },
  {
    name: "Kevin Mutua",
    role: "Software Engineer",
    location: "Athi River",
    avatar: "KM",
    gradient: "from-blue-400 to-indigo-500",
    rating: 5,
    text: "The roommate finder is a game changer. I found a compatible housemate within a week — same budget, same lifestyle. The app is super easy to use on my phone.",
    highlight: "Found roommate in 1 week",
  },
  {
    name: "Wanjiku Njeri",
    role: "Property Landlord",
    location: "Machakos Town",
    avatar: "WN",
    gradient: "from-green-400 to-emerald-500",
    rating: 5,
    text: "Listing my property on Makeja was incredibly straightforward. My 3 bedsitters were fully booked within a month. Great platform for reaching students and professionals!",
    highlight: "Fully booked in 1 month",
  },
  {
    name: "David Kioko",
    role: "University Lecturer",
    location: "Syokimau",
    avatar: "DK",
    gradient: "from-amber-400 to-orange-500",
    rating: 5,
    text: "Finally a platform designed for Machakos! The location filters and price ranges are perfectly calibrated for our area. Found a beautiful studio near my workplace.",
    highlight: "Perfect local filters",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Testimonials() {
  return (
    <section className="section-padding bg-[var(--background)]">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-overline text-green-600 mb-3"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-md text-[var(--foreground)]"
          >
            Loved by Machakos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-[var(--foreground-muted)] max-w-lg mx-auto"
          >
            Real stories from students, professionals, and landlords who found their match.
          </motion.p>
          {/* Aggregate rating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="font-black text-amber-600 dark:text-amber-400 text-sm">4.9</span>
            <span className="text-amber-600/70 dark:text-amber-500/70 text-xs">from 1,200+ reviews</span>
          </motion.div>
        </div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              className="group relative p-6 sm:p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-green-500/30 hover:shadow-[var(--shadow-md)] transition-all duration-300"
            >
              {/* Quote watermark */}
              <Quote className="absolute top-5 right-5 w-10 h-10 text-[var(--border)] group-hover:text-green-500/10 transition-colors" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Highlight pill */}
              <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 mb-3">
                ✓ {t.highlight}
              </span>

              {/* Text */}
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-[var(--border)]">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--foreground)]">{t.name}</p>
                  <p className="text-xs text-[var(--foreground-subtle)]">{t.role} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
