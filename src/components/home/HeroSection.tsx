"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, MapPin, ChevronDown, ShieldCheck, Star, ArrowRight, Sparkles,
} from "lucide-react";
import { MACHAKOS_AREAS, PROPERTY_TYPES } from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_TAGS = [
  { label: "🏠 Hostels", q: "hostel" },
  { label: "🛏 Bedsitters", q: "bedsitter" },
  { label: "🏢 1-Bedroom", q: "one_bedroom" },
  { label: "📚 Near Campus", q: "Near Campus" },
  { label: "📶 WiFi Included", q: "WiFi" },
  { label: "💰 Under KES 5k", q: "budget" },
];

const FLOATING_CARDS = [
  {
    side: "left",
    top: "top-1/3",
    content: (
      <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/20 w-56">
        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Verified Listing</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Inspected by our team</p>
        </div>
      </div>
    ),
  },
  {
    side: "right",
    top: "top-1/4",
    content: (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/20 w-52">
        <div className="flex items-center gap-1 mb-1">
          {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
        </div>
        <p className="text-[11px] font-semibold text-slate-800 dark:text-white">"Found my perfect bedsitter!"</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">— Grace M., MKU Student</p>
      </div>
    ),
  },
  {
    side: "right",
    top: "bottom-1/3",
    content: (
      <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/20 w-52">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">KM</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">500+ Active Listings</p>
          <p className="text-[10px] text-green-600 font-medium">12 new today</p>
        </div>
      </div>
    ),
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [area, setArea]   = useState("");
  const [type, setType]   = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (area)  params.set("area", area);
    if (type)  params.set("type", type);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background: deep dark green gradient + mesh */}
      <div className="absolute inset-0 bg-[#0a1a0f]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(21,128,61,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 80%, rgba(16,185,129,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 10% 90%, rgba(5,150,105,0.25) 0%, transparent 50%)
          `,
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating blobs */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[8%] w-72 h-72 rounded-full bg-green-600/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 right-[8%] w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
      />

      {/* Floating cards — desktop only */}
      <div className="hidden xl:block">
        {/* Left card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className={cn("absolute left-[4%]", FLOATING_CARDS[0].top)}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {FLOATING_CARDS[0].content}
          </motion.div>
        </motion.div>

        {/* Right cards */}
        {FLOATING_CARDS.slice(1).map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.2, duration: 0.7 }}
            className={cn("absolute right-[4%]", card.top)}
          >
            <motion.div
              animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i }}
            >
              {card.content}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32 flex flex-col items-center text-center">

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm text-green-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Machakos&apos; #1 Rental Marketplace
          <span className="flex items-center gap-1 pl-2 border-l border-green-500/30 text-green-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
        >
          Find Your Perfect
          <br />
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300">
              Home in Machakos
            </span>
            {/* underline decoration */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 400 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8C60 3 130 1 200 5C270 9 340 8 398 5"
                stroke="url(#grad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-slate-300/80 mb-10 max-w-2xl leading-relaxed"
        >
          Affordable hostels, bedsitters & apartments for students and young professionals.
          <span className="text-green-400 font-semibold"> Verified listings</span> · Direct landlord contact · No agent fees.
        </motion.p>

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <form
            onSubmit={handleSearch}
            className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-[0_25px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex flex-col sm:flex-row gap-2"
          >
            {/* Keyword */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-transparent focus-within:border-green-500/40 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search property name or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
              />
            </div>

            {/* Area */}
            <div className="relative flex items-center sm:max-w-[160px]">
              <MapPin className="absolute left-3 w-4 h-4 text-green-500 shrink-0 pointer-events-none" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full pl-9 pr-7 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">All Areas</option>
                {MACHAKOS_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Type */}
            <div className="relative flex items-center sm:max-w-[150px]">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full pl-4 pr-7 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-green-900/40 hover:shadow-green-800/40 hover:-translate-y-px active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.label}
                onClick={() => router.push(`/listings?q=${tag.q}`)}
                className="px-3.5 py-1.5 rounded-full bg-white/8 border border-white/10 text-white/75 text-xs font-medium hover:bg-white/15 hover:text-white hover:border-white/20 transition-all"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-14"
        >
          {[
            { value: "500+", label: "Active Listings" },
            { value: "1,200+", label: "Happy Tenants" },
            { value: "150+", label: "Verified Landlords" },
            { value: "4.9★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-green-500 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
