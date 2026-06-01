"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { MACHAKOS_AREAS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/utils";
import type { SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
}

const PRICE_PRESETS = [
  { label: "Under 3k",   min: 0,     max: 3000  },
  { label: "3k – 7k",   min: 3000,  max: 7000  },
  { label: "7k – 15k",  min: 7000,  max: 15000 },
  { label: "15k – 30k", min: 15000, max: 30000 },
  { label: "30k+",      min: 30000, max: undefined },
];

const DISTANCE_OPTIONS = [
  { label: "< 0.5 km", value: 0.5 },
  { label: "< 1 km",   value: 1   },
  { label: "< 2 km",   value: 2   },
  { label: "< 5 km",   value: 5   },
  { label: "< 10 km",  value: 10  },
];

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-[var(--border)] last:border-0">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)] mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function FilterDrawer({ open, onClose, filters, onChange, onApply, onReset, activeCount }: Props) {
  const toggle = (key: keyof SearchFilters, value: unknown) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const toggleAmenity = (a: string) => {
    const current = filters.amenities ?? [];
    onChange({
      ...filters,
      amenities: current.includes(a) ? current.filter((x) => x !== a) : [...current, a],
    });
  };

  const handleApply = () => { onApply(); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] rounded-t-3xl shadow-[var(--shadow-float)] lg:hidden flex flex-col max-h-[90vh]"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-green-600" />
                <span className="font-bold text-[var(--foreground)]">Filters</span>
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={onReset} className="flex items-center gap-1 text-xs text-red-500 font-medium">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--foreground-muted)] hover:bg-[var(--muted)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
              {/* Type */}
              <DrawerSection title="Property Type">
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => toggle("type", t.value)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-semibold border transition-all",
                        filters.type === t.value
                          ? "bg-green-600 text-white border-green-600"
                          : "border-[var(--border)] text-[var(--foreground-muted)]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </DrawerSection>

              {/* Price */}
              <DrawerSection title="Price Range">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => onChange({ ...filters, min_price: p.min, max_price: p.max })}
                      className={cn(
                        "px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                        filters.min_price === p.min && filters.max_price === p.max
                          ? "bg-green-50 dark:bg-green-950/40 border-green-500 text-green-700 dark:text-green-400"
                          : "border-[var(--border)] text-[var(--foreground-muted)]"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min KES"
                    value={filters.min_price ?? ""}
                    onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-green-500"
                  />
                  <span className="text-[var(--foreground-subtle)]">–</span>
                  <input type="number" placeholder="Max KES"
                    value={filters.max_price ?? ""}
                    onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-green-500"
                  />
                </div>
              </DrawerSection>

              {/* Area */}
              <DrawerSection title="Location">
                <div className="grid grid-cols-2 gap-2">
                  {MACHAKOS_AREAS.map((area) => (
                    <button key={area} onClick={() => toggle("area", area)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left",
                        filters.area === area
                          ? "bg-green-600 text-white border-green-600"
                          : "border-[var(--border)] text-[var(--foreground-muted)]"
                      )}
                    >{area}</button>
                  ))}
                </div>
              </DrawerSection>

              {/* Distance */}
              <DrawerSection title="Distance from Campus">
                <div className="grid grid-cols-3 gap-2">
                  {DISTANCE_OPTIONS.map((d) => (
                    <button key={d.value} onClick={() => toggle("max_distance", d.value)}
                      className={cn(
                        "px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                        filters.max_distance === d.value
                          ? "bg-green-600 text-white border-green-600"
                          : "border-[var(--border)] text-[var(--foreground-muted)]"
                      )}
                    >{d.label}</button>
                  ))}
                </div>
              </DrawerSection>

              {/* Gender */}
              <DrawerSection title="Gender Preference">
                <div className="flex gap-2">
                  {[{ label: "Any", value: "any" }, { label: "Male only", value: "male" }, { label: "Female only", value: "female" }].map((g) => (
                    <button key={g.value} onClick={() => toggle("gender_preference", g.value)}
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all text-center",
                        filters.gender_preference === g.value
                          ? "bg-green-600 text-white border-green-600"
                          : "border-[var(--border)] text-[var(--foreground-muted)]"
                      )}
                    >{g.label}</button>
                  ))}
                </div>
              </DrawerSection>

              {/* Amenities */}
              <DrawerSection title="Amenities">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {AMENITIES_LIST.map((a) => (
                    <label key={a} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={(filters.amenities ?? []).includes(a)}
                        onChange={() => toggleAmenity(a)}
                        className="w-4 h-4 rounded accent-green-600"
                      />
                      <span className={cn("text-sm font-medium", (filters.amenities ?? []).includes(a) ? "text-green-600" : "text-[var(--foreground-muted)]")}>
                        {a}
                      </span>
                    </label>
                  ))}
                </div>
              </DrawerSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border)] flex gap-3">
              {activeCount > 0 && (
                <button onClick={onReset} className="btn btn-secondary btn-md flex-1">
                  Clear ({activeCount})
                </button>
              )}
              <button onClick={handleApply} className="btn btn-primary btn-md flex-1">
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
