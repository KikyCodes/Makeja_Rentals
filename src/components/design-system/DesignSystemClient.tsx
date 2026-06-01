"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home, Search, Heart, Star, Bell, ArrowRight,
  Mail, Lock, Eye, EyeOff, MapPin, ShieldCheck,
  Users, Wifi, Bath, Bed, Zap, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, StatCard } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton, PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="py-12 border-b border-[var(--border)] last:border-0">
      <div className="mb-8">
        <p className="text-overline text-green-600 mb-1">{subtitle ?? "Component"}</p>
        <h2 className="text-display-sm text-[var(--foreground)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-14 w-full rounded-xl ${color} border border-black/5`} />
      <p className="text-xs font-semibold text-[var(--foreground)]">{label}</p>
      <p className="text-[10px] font-mono text-[var(--foreground-subtle)]">{hex}</p>
    </div>
  );
}

export default function DesignSystemClient() {
  const [showPass, setShowPass] = useState(false);

  return (
    <main className="pt-16 min-h-screen" style={{ background: "var(--background-soft)" }}>
      {/* Hero */}
      <div className="gradient-hero py-20">
        <div className="container-site text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-green mb-6 inline-flex text-sm px-4 py-2">Design System v1.0</span>
            <h1 className="text-display-2xl text-white mb-4">Makeja Design System</h1>
            <p className="text-green-200/80 text-lg max-w-lg mx-auto">
              Tokens, primitives, and components for building the Makeja Rentals platform.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-site py-8">

        {/* ── COLORS */}
        <Section title="Color System" subtitle="Tokens">
          <div className="space-y-8">
            {/* Green */}
            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Primary — Green</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {[
                  { c: "bg-green-50",  l: "50",  h: "#f0fdf4" },
                  { c: "bg-green-100", l: "100", h: "#dcfce7" },
                  { c: "bg-green-200", l: "200", h: "#bbf7d0" },
                  { c: "bg-green-300", l: "300", h: "#86efac" },
                  { c: "bg-green-400", l: "400", h: "#4ade80" },
                  { c: "bg-green-500", l: "500", h: "#22c55e" },
                  { c: "bg-green-600", l: "600", h: "#16a34a" },
                  { c: "bg-green-700", l: "700", h: "#15803d" },
                  { c: "bg-green-800", l: "800", h: "#166534" },
                  { c: "bg-green-950", l: "950", h: "#052e16" },
                ].map(s => <Swatch key={s.l} color={s.c} label={s.l} hex={s.h} />)}
              </div>
            </div>

            {/* Gold */}
            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Accent — Gold</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {[
                  { c: "bg-amber-50",  l: "50",  h: "#fffbeb" },
                  { c: "bg-amber-100", l: "100", h: "#fef3c7" },
                  { c: "bg-amber-200", l: "200", h: "#fde68a" },
                  { c: "bg-amber-300", l: "300", h: "#fcd34d" },
                  { c: "bg-amber-400", l: "400", h: "#fbbf24" },
                  { c: "bg-amber-500", l: "500", h: "#f59e0b" },
                  { c: "bg-amber-600", l: "600", h: "#d97706" },
                  { c: "bg-amber-700", l: "700", h: "#b45309" },
                  { c: "bg-amber-800", l: "800", h: "#92400e" },
                  { c: "bg-amber-900", l: "900", h: "#78350f" },
                ].map(s => <Swatch key={s.l} color={s.c} label={s.l} hex={s.h} />)}
              </div>
            </div>

            {/* Warm neutrals */}
            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Neutral — Warm</p>
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
                {[
                  { c: "bg-[#faf9f7]", l: "50",  h: "#faf9f7" },
                  { c: "bg-[#f5f3ef]", l: "100", h: "#f5f3ef" },
                  { c: "bg-[#ede9e1]", l: "200", h: "#ede9e1" },
                  { c: "bg-[#ddd7cb]", l: "300", h: "#ddd7cb" },
                  { c: "bg-[#c4baaa]", l: "400", h: "#c4baaa" },
                  { c: "bg-[#a8998a]", l: "500", h: "#a8998a" },
                  { c: "bg-[#8d7d6d]", l: "600", h: "#8d7d6d" },
                  { c: "bg-[#5c4e40]", l: "800", h: "#5c4e40" },
                  { c: "bg-[#3d3228]", l: "900", h: "#3d3228" },
                ].map(s => <Swatch key={s.l} color={s.c} label={s.l} hex={s.h} />)}
              </div>
            </div>

            {/* Semantic */}
            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Semantic Tokens</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { label: "Background",       token: "--background",       bg: "bg-white border" },
                  { label: "Background Soft",  token: "--background-soft",  bg: "bg-[#faf9f7] border" },
                  { label: "Background Muted", token: "--background-muted", bg: "bg-[#f5f3ef] border" },
                  { label: "Border",           token: "--border",           bg: "bg-[#e5e0d8] border" },
                  { label: "Foreground",       token: "--foreground",       bg: "bg-[#0d1410]" },
                  { label: "Foreground Muted", token: "--foreground-muted", bg: "bg-[#4a5568]" },
                  { label: "Primary",          token: "--primary",          bg: "bg-green-600" },
                  { label: "Accent",           token: "--accent",           bg: "bg-amber-500" },
                ].map(s => (
                  <div key={s.token} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                    <div className={`w-8 h-8 rounded-lg shrink-0 ${s.bg}`} />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">{s.label}</p>
                      <p className="text-[10px] font-mono text-[var(--foreground-subtle)]">{s.token}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── TYPOGRAPHY */}
        <Section title="Typography" subtitle="Type Scale">
          <div className="bg-[var(--background)] rounded-2xl border border-[var(--border)] p-8 space-y-8 overflow-hidden">
            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Display — Plus Jakarta Sans</p>
              <div className="space-y-4">
                {[
                  { cls: "text-display-2xl", label: "Display 2XL · 900 · -3%",  sample: "Find Your Space" },
                  { cls: "text-display-xl",  label: "Display XL  · 800 · -2.5%", sample: "Find Your Space" },
                  { cls: "text-display-lg",  label: "Display LG  · 800 · -2%",   sample: "Find Your Space" },
                  { cls: "text-display-md",  label: "Display MD  · 700 · -1.5%", sample: "Makeja Rentals" },
                  { cls: "text-display-sm",  label: "Display SM  · 700 · -1%",   sample: "Browse Listings" },
                ].map(t => (
                  <div key={t.cls} className="flex items-baseline gap-6 flex-wrap">
                    <p className={`${t.cls} gradient-text-green shrink-0`}>{t.sample}</p>
                    <span className="text-xs font-mono text-[var(--foreground-subtle)]">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Body — Geist Sans</p>
              <div className="space-y-3">
                {[
                  { size: "text-xl",   w: "font-semibold", label: "20px Semibold — Section intro" },
                  { size: "text-base", w: "font-normal",   label: "16px Regular — Body copy, descriptions" },
                  { size: "text-sm",   w: "font-medium",   label: "14px Medium — Labels, list items, cards" },
                  { size: "text-xs",   w: "font-medium",   label: "12px Medium — Captions, badges, metadata" },
                ].map(t => (
                  <div key={t.size} className="flex items-center gap-4">
                    <p className={`${t.size} ${t.w} text-[var(--foreground)] w-48 shrink-0`}>{t.label.split(" — ")[0]}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div>
              <p className="text-label text-[var(--foreground-muted)] mb-4">Special Styles</p>
              <div className="flex flex-wrap gap-8 items-center">
                <p className="text-overline text-green-600">Overline text</p>
                <p className="text-label text-[var(--foreground-muted)]">Label text</p>
                <p className="text-sm font-mono text-[var(--foreground-muted)] bg-[var(--muted)] px-2 py-1 rounded">mono code</p>
                <p className="text-2xl font-black gradient-text-gold">Gold Gradient</p>
                <p className="text-2xl font-black gradient-text-green">Green Gradient</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── BUTTONS */}
        <Section title="Button System" subtitle="Interactive">
          <div className="space-y-6">
            <Card>
              <p className="text-label text-[var(--foreground-muted)] mb-5">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="gold">Gold</Button>
                <Button variant="outline-green">Outline Green</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </Card>

            <Card>
              <p className="text-label text-[var(--foreground-muted)] mb-5">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </Card>

            <Card>
              <p className="text-label text-[var(--foreground-muted)] mb-5">With icons + states</p>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Search className="w-4 h-4" />}>Search Listings</Button>
                <Button variant="gold" leftIcon={<Star className="w-4 h-4" />}>Featured</Button>
                <Button rightIcon={<ArrowRight className="w-4 h-4" />} variant="outline-green">Browse All</Button>
                <Button loading>Loading...</Button>
                <Button disabled>Disabled</Button>
              </div>
            </Card>
          </div>
        </Section>

        {/* ── BADGES */}
        <Section title="Badge System" subtitle="Labels">
          <Card>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green" dot>Verified</Badge>
              <Badge variant="green"><ShieldCheck className="w-3 h-3" /> Verified Landlord</Badge>
              <Badge variant="gold">✦ Featured</Badge>
              <Badge variant="gold" dot>Premium</Badge>
              <Badge variant="red" dot>Unavailable</Badge>
              <Badge variant="blue">New</Badge>
              <Badge variant="purple">Pro</Badge>
              <Badge variant="warm">Hostel</Badge>
              <Badge variant="warm">WiFi</Badge>
              <Badge variant="warm">Near Campus</Badge>
            </div>
          </Card>
        </Section>

        {/* ── INPUTS */}
        <Section title="Input System" subtitle="Forms">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="space-y-4">
                <Input label="Email Address" placeholder="you@example.com" type="email" leftIcon={<Mail className="w-4 h-4" />} />
                <Input
                  label="Password"
                  placeholder="Min. 8 characters"
                  type={showPass ? "text" : "password"}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onRightIconClick={() => setShowPass(!showPass)}
                />
                <Input label="Location" placeholder="e.g. Gate B Road, Machakos" leftIcon={<MapPin className="w-4 h-4" />} />
                <Input label="Error State" placeholder="Type here" error="This field is required" />
                <Input label="With hint" placeholder="Search..." leftIcon={<Search className="w-4 h-4" />} hint="Try: bedsitter, hostel, 1 bedroom" />
              </div>
            </Card>

            <Card>
              <div className="space-y-4">
                <Select label="Property Type">
                  <option value="">Select type...</option>
                  <option>Hostel</option>
                  <option>Bedsitter</option>
                  <option>1 Bedroom</option>
                  <option>Studio</option>
                </Select>
                <Select label="Area" leftIcon={<MapPin className="w-4 h-4" />}>
                  <option>Machakos Town</option>
                  <option>Athi River</option>
                  <option>Mavoko</option>
                </Select>
                <Textarea label="Description" placeholder="Describe your property..." rows={4} hint="Minimum 50 characters" />
              </div>
            </Card>
          </div>
        </Section>

        {/* ── CARDS */}
        <Section title="Card System" subtitle="Surfaces">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <StatCard label="Total Listings"   value="543"   icon={<Home />}  change="+8%"  color="green"  />
            <StatCard label="Total Views"      value="12.4k" icon={<Eye />}   change="+24%" color="blue"   />
            <StatCard label="Saved by Users"   value="1,208" icon={<Heart />} change="+15%" color="red"    />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card><p className="text-sm text-[var(--foreground)]">Default Card — elevated, rounded, soft shadow</p></Card>
            <Card variant="flat"><p className="text-sm text-[var(--foreground)]">Flat Card — no shadow, border only</p></Card>
            <Card variant="interactive"><p className="text-sm text-[var(--foreground)]">Interactive Card — hover lift effect</p></Card>
          </div>
        </Section>

        {/* ── AVATARS */}
        <Section title="Avatar System" subtitle="Users">
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              {(["xs","sm","md","lg","xl","2xl"] as const).map(size => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <Avatar name="Grace Mwende" size={size} />
                  <span className="text-[10px] text-[var(--foreground-subtle)]">{size}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2">
                <Avatar name="John Mwangi" size="lg" shape="rounded" />
                <span className="text-[10px] text-[var(--foreground-subtle)]">rounded</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Grace Mwende", "Brian Kamau", "Amina Juma", "Peter Otieno", "Carol Njeri"].map(name => (
                <div key={name} className="flex items-center gap-2">
                  <Avatar name={name} size="sm" />
                  <span className="text-xs text-[var(--foreground)]">{name}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* ── SKELETONS */}
        <Section title="Loading States" subtitle="Feedback">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>

          <Card className="mt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            <div className="flex gap-3 mt-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <div className="dot-loader flex gap-1.5 items-center" style={{ color: "var(--primary)" }}>
                <span /><span /><span />
              </div>
            </div>
          </Card>
        </Section>

        {/* ── EMPTY STATES */}
        <Section title="Empty States" subtitle="Feedback">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <EmptyState icon="🔍" title="No listings found" description="Try adjusting your filters or search in a different area." size="sm" />
            </Card>
            <Card>
              <EmptyState icon="❤️" title="No saved properties" description="Heart any listing to save it here for later." size="sm" />
            </Card>
            <Card>
              <EmptyState icon="👥" title="No roommates yet" description="Be the first to post your roommate profile." size="sm" action={{ label: "Post Profile", onClick: () => {} }} />
            </Card>
          </div>
        </Section>

        {/* ── GLASS & GRADIENTS */}
        <Section title="Surfaces & Gradients" subtitle="Visual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hero gradient */}
            <div className="gradient-hero rounded-2xl p-8 min-h-40 relative overflow-hidden">
              <div className="glass rounded-xl p-4 w-fit">
                <p className="text-white font-semibold text-sm">Glass on Hero</p>
                <p className="text-white/60 text-xs mt-1">backdrop-filter: blur(16px)</p>
              </div>
              <div className="absolute bottom-4 right-4">
                <Badge variant="green">Active</Badge>
              </div>
            </div>

            {/* Green gradient */}
            <div className="gradient-green rounded-2xl p-8 min-h-40 flex flex-col justify-end">
              <p className="text-white font-black text-display-sm">Premium Green</p>
              <p className="text-white/70 text-sm mt-1">For CTAs and feature highlights</p>
            </div>

            {/* Gold gradient */}
            <div className="gradient-gold rounded-2xl p-8 min-h-40 flex flex-col justify-end">
              <p className="text-white font-black text-display-sm">Gold Accent</p>
              <p className="text-white/70 text-sm mt-1">For featured, premium, verified</p>
            </div>

            {/* Dark surface */}
            <div className="bg-[var(--dark-bg,#0a0f0d)] rounded-2xl p-8 min-h-40 flex flex-col justify-end border border-[#1e2e22]">
              <p className="text-white font-black text-display-sm">Dark Surface</p>
              <p className="text-[#6b8a74] text-sm mt-1">Deep green-tinted dark mode</p>
            </div>
          </div>
        </Section>

        {/* ── SPACING */}
        <Section title="Spacing & Radius System" subtitle="Layout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <p className="text-label text-[var(--foreground-muted)] mb-5">Border Radius Scale</p>
              <div className="flex flex-wrap gap-4 items-end">
                {[
                  { r: "rounded",    l: "xs — 6px" },
                  { r: "rounded-lg", l: "sm — 8px" },
                  { r: "rounded-xl", l: "md — 12px" },
                  { r: "rounded-2xl",l: "lg — 16px" },
                  { r: "rounded-3xl",l: "xl — 24px" },
                  { r: "rounded-full",l: "full" },
                ].map(s => (
                  <div key={s.l} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 bg-green-100 dark:bg-green-950 border-2 border-green-300 dark:border-green-800 ${s.r}`} />
                    <span className="text-[10px] text-center text-[var(--foreground-subtle)]">{s.l}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-label text-[var(--foreground-muted)] mb-5">Shadow Scale</p>
              <div className="space-y-3">
                {[
                  { cls: "shadow-[var(--shadow-xs)]",    l: "xs — Subtle" },
                  { cls: "shadow-[var(--shadow-soft)]",  l: "soft — Cards" },
                  { cls: "shadow-[var(--shadow-card)]",  l: "card — Property cards" },
                  { cls: "shadow-[var(--shadow-md)]",    l: "md — Dropdowns" },
                  { cls: "shadow-[var(--shadow-float)]", l: "float — Modals" },
                ].map(s => (
                  <div key={s.l} className={`h-10 ${s.cls} rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center px-4`}>
                    <span className="text-xs text-[var(--foreground-muted)]">{s.l}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>

        {/* ── ANIMATIONS REFERENCE */}
        <Section title="Animation Reference" subtitle="Motion">
          <Card>
            <p className="text-label text-[var(--foreground-muted)] mb-5">CSS Classes</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-mono">
              {[
                ".animate-fade-in", ".animate-fade-up", ".animate-fade-down",
                ".animate-fade-left", ".animate-fade-right", ".animate-scale-in",
                ".animate-float", ".animate-spin-slow", ".animate-pulse-green",
                ".delay-75", ".delay-100", ".delay-150", ".delay-200", ".delay-300",
              ].map(cls => (
                <div key={cls} className="px-3 py-2 rounded-lg bg-[var(--muted)] text-[var(--foreground-muted)] text-xs">
                  {cls}
                </div>
              ))}
            </div>
            <p className="text-label text-[var(--foreground-muted)] mt-6 mb-4">Framer Motion presets</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Fade Up",  from: { opacity: 0, y: 20 } },
                { label: "Scale In", from: { opacity: 0, scale: 0.9 } },
                { label: "Fade In",  from: { opacity: 0 } },
                { label: "Slide Up",  from: { opacity: 0, y: 40 } },
              ].map(p => (
                <motion.div
                  key={p.label}
                  initial={p.from}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-20px" }}
                  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                  className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30 text-center"
                >
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">{p.label}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </Section>

      </div>

      {/* Footer note */}
      <div className="border-t border-[var(--border)] py-8">
        <div className="container-site text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Makeja Rentals Design System · Built with Tailwind CSS v4 + Framer Motion
          </p>
        </div>
      </div>
    </main>
  );
}
