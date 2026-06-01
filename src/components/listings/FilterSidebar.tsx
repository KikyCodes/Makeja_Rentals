"use client";

import { motion } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { MACHAKOS_AREAS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/utils";
import type { SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
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
  { label: "On campus",    value: 0.5 },
  { label: "< 1 km",      value: 1   },
  { label: "< 2 km",      value: 2   },
  { label: "< 5 km",      value: 5   },
  { label: "< 10 km",     value: 10  },
];

const GENDER_OPTIONS = [
  { label: "Any",          value: "any"    },
  { label: "Male only",    value: "male"   },
  { label: "Female only",  value: "female" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-[var(--border)] last:border-0">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)] mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onApply, onReset, activeCount }: Props) {
  const toggle = (key: keyof SearchFilters, value: unknown) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });

  const toggleAmenity = (a: string) => {
    const current = filters.amenities ?? [];
    onChange({
      ...filters,
      amenities: current.includes(a) ? current.filter((x) => x !== a) : [...current, a],
    });
  };

  return (
    <aside className="w-64 xl:w-72 shrink-0 hidden lg:block">
      <div className="sticky top-[130px] bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-green-600" />
            <span className="font-bold text-sm text-[var(--foreground)]">Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button onClick={onReset} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="px-5 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          {/* Property Type */}
          <Section title="Property Type">
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggle("type", t.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    filters.type === t.value
                      ? "bg-green-600 text-white border-green-600"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-400 hover:text-green-600"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Price Range */}
          <Section title="Price Range">
            <div className="space-y-2 mb-4">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChange({ ...filters, min_price: p.min, max_price: p.max })}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                    filters.min_price === p.min && filters.max_price === p.max
                      ? "bg-green-50 dark:bg-green-950/40 border-green-500 text-green-700 dark:text-green-400"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-300"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price ?? ""}
                onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs outline-none focus:border-green-500"
              />
              <span className="text-[var(--foreground-subtle)] text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price ?? ""}
                onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs outline-none focus:border-green-500"
              />
            </div>
          </Section>

          {/* Location */}
          <Section title="Location / Area">
            <div className="space-y-1 max-h-44 overflow-y-auto no-scrollbar">
              {MACHAKOS_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                  <input
                    type="radio"
                    name="area"
                    checked={filters.area === area}
                    onChange={() => toggle("area", area)}
                    className="w-3.5 h-3.5 accent-green-600"
                  />
                  <span className={cn("text-xs font-medium transition-colors", filters.area === area ? "text-green-600" : "text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]")}>
                    {area}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Distance from Campus */}
          <Section title="Distance from Campus">
            <div className="space-y-1.5">
              {DISTANCE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggle("max_distance", d.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                    filters.max_distance === d.value
                      ? "bg-green-50 dark:bg-green-950/40 border-green-500 text-green-700 dark:text-green-400"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-300"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Furnishing */}
          <Section title="Furnishing">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "furnished",      label: "Furnished" },
                { value: "semi_furnished", label: "Semi-Furnished" },
                { value: "unfurnished",    label: "Unfurnished" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => toggle("furnishing", f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    filters.furnishing === f.value
                      ? "bg-green-600 text-white border-green-600"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-400 hover:text-green-600"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Gender Preference */}
          <Section title="Gender Preference">
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => toggle("gender_preference", g.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    filters.gender_preference === g.value
                      ? "bg-green-600 text-white border-green-600"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-400 hover:text-green-600"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <div className="space-y-1.5">
              {AMENITIES_LIST.map((a) => (
                <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={(filters.amenities ?? []).includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="w-3.5 h-3.5 rounded accent-green-600"
                  />
                  <span className={cn("text-xs font-medium transition-colors", (filters.amenities ?? []).includes(a) ? "text-green-600" : "text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]")}>
                    {a}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Availability */}
          <Section title="Availability">
            <div className="flex gap-2">
              {[
                { label: "Available Now", value: true },
                { label: "All",          value: undefined },
              ].map((opt) => (
                <button
                  key={String(opt.label)}
                  onClick={() => onChange({ ...filters, is_available: opt.value })}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    filters.is_available === opt.value
                      ? "bg-green-600 text-white border-green-600"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-400"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Apply button */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={onApply}
            className="w-full btn btn-primary btn-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </aside>
  );
}
