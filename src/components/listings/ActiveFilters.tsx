"use client";

import { X } from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import type { SearchFilters } from "@/types";

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onReset: () => void;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export default function ActiveFilters({ filters, onChange, onReset }: Props) {
  const chips: Chip[] = [];

  if (filters.query) {
    chips.push({ key: "q", label: `"${filters.query}"`, onRemove: () => onChange({ ...filters, query: "" }) });
  }
  if (filters.type) {
    chips.push({ key: "type", label: formatPropertyType(filters.type), onRemove: () => onChange({ ...filters, type: "" }) });
  }
  if (filters.area) {
    chips.push({ key: "area", label: filters.area, onRemove: () => onChange({ ...filters, area: "" }) });
  }
  if (filters.min_price || filters.max_price) {
    const label = filters.min_price && filters.max_price
      ? `${formatPrice(filters.min_price)} – ${formatPrice(filters.max_price)}`
      : filters.min_price
        ? `From ${formatPrice(filters.min_price)}`
        : `Up to ${formatPrice(filters.max_price!)}`;
    chips.push({ key: "price", label, onRemove: () => onChange({ ...filters, min_price: undefined, max_price: undefined }) });
  }
  if (filters.furnishing) {
    const labels: Record<string, string> = { furnished: "Furnished", semi_furnished: "Semi-Furnished", unfurnished: "Unfurnished" };
    chips.push({ key: "furnishing", label: labels[filters.furnishing] ?? filters.furnishing, onRemove: () => onChange({ ...filters, furnishing: "" }) });
  }
  if (filters.gender_preference && filters.gender_preference !== "any") {
    chips.push({ key: "gender", label: `${filters.gender_preference === "male" ? "Male" : "Female"} only`, onRemove: () => onChange({ ...filters, gender_preference: "" }) });
  }
  if (filters.max_distance) {
    chips.push({ key: "distance", label: `< ${filters.max_distance} km from campus`, onRemove: () => onChange({ ...filters, max_distance: undefined }) });
  }
  if (filters.is_available === true) {
    chips.push({ key: "available", label: "Available now", onRemove: () => onChange({ ...filters, is_available: undefined }) });
  }
  (filters.amenities ?? []).forEach((a) => {
    chips.push({
      key: `amenity-${a}`,
      label: a,
      onRemove: () => onChange({ ...filters, amenities: filters.amenities?.filter((x) => x !== a) }),
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-xs font-medium text-[var(--foreground-subtle)] shrink-0">Active:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-xs font-semibold text-green-700 dark:text-green-400"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-green-600 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onReset}
          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
