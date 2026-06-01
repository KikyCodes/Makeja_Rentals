"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, MapPin, Shield, Star } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  /** Heading on the right (form) panel */
  title: string;
  /** Subtext under the heading */
  subtitle: string;
}

const PERKS = [
  { icon: MapPin,  text: "500+ verified properties in Machakos" },
  { icon: Shield,  text: "Fraud-proof listings, every unit checked" },
  { icon: Star,    text: "Trusted by 10,000+ students & landlords" },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #061209 0%, #0d2318 50%, #081a0e 100%)" }}
      >
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 20% 80%, #16a34a33, transparent), radial-gradient(ellipse 40% 40% at 80% 10%, #15803d22, transparent)",
          }}
        />

        {/* Top: Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/50 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Makeja<span className="text-green-400">Rentals</span>
          </span>
        </Link>

        {/* Middle: Headline + perks */}
        <div className="relative space-y-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl xl:text-5xl font-black text-white leading-tight"
            >
              Find your<br />
              <span className="text-green-400">perfect home</span><br />
              in Machakos.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 text-green-200/70 text-base leading-relaxed"
            >
              Affordable, student-friendly rentals — bedsitters,<br />
              hostels, studios & more. All vetted, all real.
            </motion.p>
          </div>

          <ul className="space-y-4">
            {PERKS.map((perk, i) => (
              <motion.li
                key={perk.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-green-900/60 border border-green-700/40 flex items-center justify-center shrink-0">
                  <perk.icon className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-green-100/80 text-sm">{perk.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Bottom: Social proof pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-green-800/60 bg-green-950/40 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {["bg-green-500", "bg-emerald-400", "bg-teal-500"].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-green-950 flex items-center justify-center text-white text-xs font-bold`}>
                  {["J", "A", "M"][i]}
                </div>
              ))}
            </div>
            <p className="text-green-200/80 text-xs">
              <span className="font-semibold text-white">2,400+</span> students joined this month
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20 bg-white dark:bg-slate-950 overflow-y-auto">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10 w-fit">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 dark:text-white text-lg">
            Makeja<span className="text-green-600">Rentals</span>
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
