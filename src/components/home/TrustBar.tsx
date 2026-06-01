"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, HeadphonesIcon, BadgeCheck, Lock } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Verified Listings", desc: "Every property inspected" },
  { icon: BadgeCheck,  label: "Trusted Landlords", desc: "ID-verified hosts" },
  { icon: Zap,         label: "Instant Contact",   desc: "Direct WhatsApp & call" },
  { icon: Lock,        label: "Secure Platform",   desc: "Your data is protected" },
  { icon: HeadphonesIcon, label: "24/7 Support",   desc: "Always here to help" },
];

export default function TrustBar() {
  return (
    <section className="relative z-10 -mt-6 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-[var(--surface)] rounded-2xl shadow-[var(--shadow-float)] border border-[var(--border)] px-6 py-5"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0">
                <item.icon className="w-4.5 h-4.5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">{item.label}</p>
                <p className="text-[10px] text-[var(--foreground-subtle)] mt-0.5 hidden sm:block">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
