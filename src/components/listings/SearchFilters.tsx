"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MACHAKOS_AREAS, PROPERTY_TYPES } from "@/lib/utils";
import type { SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

export default function SearchFiltersBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: params.get("q") ?? "",
    type: (params.get("type") as SearchFilters["type"]) ?? "",
    area: params.get("area") ?? "",
    min_price: params.get("min") ? Number(params.get("min")) : undefined,
    max_price: params.get("max") ? Number(params.get("max")) : undefined,
    furnishing: (params.get("furnishing") as SearchFilters["furnishing"]) ?? "",
    sort_by: (params.get("sort") as SearchFilters["sort_by"]) ?? "newest",
  });

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (filters.query) p.set("q", filters.query);
    if (filters.type) p.set("type", filters.type);
    if (filters.area) p.set("area", filters.area);
    if (filters.min_price) p.set("min", String(filters.min_price));
    if (filters.max_price) p.set("max", String(filters.max_price));
    if (filters.furnishing) p.set("furnishing", filters.furnishing);
    if (filters.sort_by) p.set("sort", filters.sort_by);
    router.push(`/listings?${p.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ query: "", type: "", area: "", sort_by: "newest" });
    router.push("/listings");
  };

  const hasActiveFilters =
    filters.query || filters.type || filters.area || filters.min_price || filters.max_price || filters.furnishing;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search listings..."
              value={filters.query ?? ""}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
          </div>

          {/* Area */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filters.area ?? ""}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm outline-none appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">All Areas</option>
              {MACHAKOS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={filters.type ?? ""}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as SearchFilters["type"] })}
              className="px-4 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm outline-none appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                showAdvanced
                  ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-green-500" />}
            </button>
            <button
              onClick={applyFilters}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Min Price (KES)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_price ?? ""}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Max Price (KES)</label>
              <input
                type="number"
                placeholder="50,000"
                value={filters.max_price ?? ""}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Furnishing</label>
              <select
                value={filters.furnishing ?? ""}
                onChange={(e) => setFilters({ ...filters, furnishing: e.target.value as SearchFilters["furnishing"] })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm outline-none"
              >
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Sort By</label>
              <select
                value={filters.sort_by ?? "newest"}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as SearchFilters["sort_by"] })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium col-span-full"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
