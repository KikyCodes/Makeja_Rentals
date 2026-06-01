"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Home, LayoutDashboard, Users } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-padding bg-[var(--background-muted)]">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Tenant CTA — larger */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative overflow-hidden rounded-3xl p-8 sm:p-12"
            style={{
              background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
            }}
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-20 -translate-x-20 pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6">
                <Home className="w-7 h-7 text-white" />
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-300 mb-3">For Tenants</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                Find Your Dream Home<br />in Machakos Today
              </h3>
              <p className="text-green-100/75 mb-8 max-w-sm leading-relaxed">
                Browse 500+ verified listings. Filter by your budget, preferred area, and amenities. No agent fees, ever.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all group shadow-lg"
                >
                  Browse Listings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/roommates"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all group"
                >
                  <Users className="w-4 h-4" />
                  Find Roommates
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Landlord CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-10 flex flex-col"
          >
            {/* Accent circle */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green-500/8 -translate-y-16 translate-x-16 pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-6">
              <LayoutDashboard className="w-7 h-7 text-green-600" />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-600 mb-3">For Landlords</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mb-4 leading-tight">
              List Your Property.<br />Reach Thousands.
            </h3>
            <p className="text-[var(--foreground-muted)] mb-8 flex-1 leading-relaxed">
              Post for free and connect directly with pre-screened tenants looking in Machakos right now.
            </p>

            <div className="space-y-3">
              <Link
                href="/dashboard/add"
                className="btn btn-primary btn-md w-full group"
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                List a Property — Free
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-secondary btn-md w-full"
              >
                Create Landlord Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
