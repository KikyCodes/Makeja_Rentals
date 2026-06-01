"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, MapPin, ArrowRight, CheckCircle2, Heart, MessageCircle } from "lucide-react";

const PROFILES = [
  { initials: "BK", gradient: "from-blue-400 to-indigo-500",  name: "Brian K.",  budget: "KES 3,000–6,000", area: "Machakos Town", tags: ["Student", "Non-smoker"] },
  { initials: "AJ", gradient: "from-purple-400 to-pink-500",  name: "Amina J.",  budget: "KES 5,000–9,000", area: "Athi River",    tags: ["Professional", "Quiet"] },
  { initials: "DM", gradient: "from-green-400 to-teal-500",   name: "Dennis M.", budget: "KES 2,500–4,500", area: "Tala",          tags: ["Student", "Flexible"] },
];

const PERKS = [
  "Filter by lifestyle & budget",
  "Message potential roommates",
  "Mutual match system",
  "Student & professional verified",
];

export default function RoommateTeaser() {
  return (
    <section className="section-padding bg-[var(--background-muted)]">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-overline text-green-600 block mb-3">Roommate Finder</span>
            <h2 className="text-display-md text-[var(--foreground)] mb-4">
              Find Your Perfect<br />
              <span className="gradient-text-green">Housemate</span>
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-md">
              Split rent with someone who matches your lifestyle and budget. Our smart roommate finder connects students and professionals across Machakos.
            </p>

            <ul className="space-y-3 mb-10">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/roommates" className="btn btn-primary btn-md group">
                Browse Roommates
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/roommates" className="btn btn-secondary btn-md">
                Post Your Profile
              </Link>
            </div>
          </motion.div>

          {/* Right — profile cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {PROFILES.map((p, i) => (
              <motion.div
                key={p.initials}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-green-500/40 hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--foreground)]">{p.name}</p>
                  <p className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)] mt-0.5 mb-2">
                    <MapPin className="w-3 h-3" /> {p.area} · {p.budget}/mo
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((tag) => (
                      <span key={tag} className="badge badge-warm text-[10px]">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--foreground-muted)] hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--foreground-muted)] hover:bg-green-50 hover:text-green-600 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                <Users className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                  200+ active seekers this week
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
