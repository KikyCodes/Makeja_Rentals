"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, Sun, Moon, Plus, Home, Search, Users, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/listings",  label: "Browse",   icon: Search },
  { href: "/roommates", label: "Roommates", icon: Users  },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname              = usePathname();
  const { theme, setTheme }   = useTheme();
  const isHome                = pathname === "/";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;

  return (
    <>
      <nav className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        solid
          ? "bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-[var(--shadow-xs)]"
          : "bg-transparent"
      )}>
        <div className="container-site">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group focus-ring">
              <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:shadow-[var(--shadow-glow-green)]">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className={cn("font-display font-bold text-[17px] tracking-tight transition-colors", solid ? "text-[var(--foreground)]" : "text-white")}>
                Makeja<span className="text-green-500"> Rentals</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                      active
                        ? "text-green-600 bg-green-50 dark:bg-green-950/40"
                        : solid
                          ? "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-green-50 dark:bg-green-950/40 -z-10"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 focus-ring",
                    solid
                      ? "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* Saved */}
              <Link
                href="/saved"
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 focus-ring",
                  solid
                    ? "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Heart className="w-4 h-4" />
              </Link>

              <div className="w-px h-5 bg-[var(--border)] mx-1" />

              {/* Sign in */}
              <Link
                href="/auth/login"
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 focus-ring",
                  solid
                    ? "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                Sign In
              </Link>

              {/* List property CTA */}
              <Link
                href="/dashboard/add"
                className="btn btn-primary btn-sm animate-pulse-green"
              >
                <Plus className="w-3.5 h-3.5" />
                List Property
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus-ring",
                solid ? "text-[var(--foreground)]" : "text-white"
              )}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[var(--background)] border-l border-[var(--border)] shadow-[var(--shadow-float)] md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-display font-bold text-[var(--foreground)]">
                    Makeja<span className="text-green-500"> Rentals</span>
                  </span>
                </Link>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--foreground-muted)] hover:bg-[var(--muted)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV.map((link) => {
                  const active = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                        active
                          ? "bg-green-50 dark:bg-green-950/40 text-green-600"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}

                <Link href="/saved" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  <Heart className="w-4 h-4" /> Saved
                </Link>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border)] space-y-2">
                <Link href="/auth/login" onClick={() => setOpen(false)} className="btn btn-secondary btn-md w-full">
                  Sign In
                </Link>
                <Link href="/dashboard/add" onClick={() => setOpen(false)} className="btn btn-primary btn-md w-full">
                  <Plus className="w-4 h-4" /> List Property
                </Link>

                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--muted)] transition-colors"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
