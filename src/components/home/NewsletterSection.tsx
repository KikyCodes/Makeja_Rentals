"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <section className="section-padding bg-[var(--background)]">
      <div className="container-site">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 px-6 py-12 sm:px-12 text-center"
        >
          {/* Decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-green-600" />
            </div>

            <span className="text-overline text-green-600 block mb-3">Stay Updated</span>
            <h2 className="text-display-sm text-[var(--foreground)] mb-3">
              Get New Listings First
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-md mx-auto mb-8">
              Join 2,000+ Machakos residents who get instant alerts when new rentals match their preferences.
            </p>

            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  You&apos;re on the list! We&apos;ll be in touch.
                </span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-subtle)] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white dark:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-subtle)] text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-md shrink-0 group disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="text-[11px] text-[var(--foreground-subtle)] mt-4">
              No spam. Unsubscribe anytime. Your data is protected.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
