"use client";

import { motion } from "framer-motion";
import { Search, ShieldCheck, MessageCircle, Key } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    number: "01",
    title: "Search & Filter",
    description:
      "Browse hundreds of verified listings. Filter by price, area, type, and amenities to find your perfect match.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    connector: "from-blue-400 to-green-400",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Verify & Trust",
    description:
      "Every listing shows verification badges. Read reviews from real tenants and trust our inspection guarantee.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    connector: "from-green-400 to-purple-400",
  },
  {
    icon: MessageCircle,
    number: "03",
    title: "Contact Landlord",
    description:
      "Chat directly with landlords via WhatsApp or in-app messaging. Arrange viewings and negotiate terms — free.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    connector: "from-purple-400 to-amber-400",
  },
  {
    icon: Key,
    number: "04",
    title: "Move In",
    description:
      "Sign your agreement and move into your new home. Leave a review to help the next tenant find theirs.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    connector: null,
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-[var(--background)]">
      <div className="container-site">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-overline text-green-600 mb-3"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-md text-[var(--foreground)]"
          >
            Your Home in 4 Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-[var(--foreground-muted)] max-w-xl mx-auto"
          >
            Finding the right rental in Machakos has never been simpler. We&apos;ve streamlined the entire process.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-300 via-green-300 via-purple-300 to-amber-300 dark:from-blue-800 dark:via-green-800 dark:via-purple-800 dark:to-amber-800 z-0" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:px-6 z-10"
            >
              {/* Icon circle */}
              <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 shadow-sm ring-4 ring-[var(--background)] relative`}>
                <step.icon className={`w-8 h-8 ${step.color}`} />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>

              {/* Step number */}
              <p className={`text-5xl font-black opacity-10 absolute top-0 left-4 lg:left-6 select-none ${step.color}`}>
                {step.number}
              </p>

              <h3 className="font-bold text-base text-[var(--foreground)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
