"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, List, SlidersHorizontal, Search, ChevronDown,
  ArrowUpDown, MapPin, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MACHAKOS_AREAS } from "@/lib/utils";
import type { SearchFilters, Property, PaginatedResult, SortOption } from "@/types";
import PropertyCard from "./PropertyCard";
import PropertyListCard from "./PropertyListCard";
import FilterSidebar from "./FilterSidebar";
import FilterDrawer from "./FilterDrawer";
import ActiveFilters from "./ActiveFilters";
import PaginationBar from "./PaginationBar";
import { ListingPageSkeleton } from "@/components/ui/Skeleton";
import { NoListingsEmpty } from "@/components/ui/EmptyState";

type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "popular",    label: "Most popular" },
  { value: "distance",   label: "Nearest campus" },
];

const PER_PAGE_OPTIONS = [6, 12, 24];

function filtersToParams(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.query)            p.set("q",         f.query);
  if (f.type)             p.set("type",       f.type);
  if (f.area)             p.set("area",       f.area);
  if (f.min_price)        p.set("min",        String(f.min_price));
  if (f.max_price)        p.set("max",        String(f.max_price));
  if (f.furnishing)       p.set("furnishing", f.furnishing);
  if (f.amenities?.length) p.set("amenities",  f.amenities.join(","));
  if (f.gender_preference && f.gender_preference !== "any")
                          p.set("gender",     f.gender_preference);
  if (f.max_distance)     p.set("distance",   String(f.max_distance));
  if (f.is_available)     p.set("available",  "true");
  if (f.sort_by)          p.set("sort",       f.sort_by);
  if (f.page && f.page > 1) p.set("page",    String(f.page));
  if (f.per_page)         p.set("per_page",   String(f.per_page));
  return p;
}

function countActiveFilters(f: SearchFilters): number {
  return [
    f.type, f.area, f.min_price, f.max_price,
    f.furnishing, f.gender_preference && f.gender_preference !== "any" ? f.gender_preference : undefined,
    f.max_distance, f.is_available,
    ...(f.amenities ?? []),
  ].filter(Boolean).length;
}

export default function ListingsClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [view, setView]                 = useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const [result, setResult]             = useState<PaginatedResult<Property> | null>(null);
  const [favorites, setFavorites]       = useState<Set<string>>(new Set());

  // Build initial filter state from URL params
  const initFilters = useCallback((): SearchFilters => ({
    query:            searchParams.get("q")         ?? "",
    type:             (searchParams.get("type") as SearchFilters["type"]) ?? "",
    area:             searchParams.get("area")       ?? "",
    min_price:        searchParams.get("min")  ? Number(searchParams.get("min"))       : undefined,
    max_price:        searchParams.get("max")  ? Number(searchParams.get("max"))       : undefined,
    furnishing:       (searchParams.get("furnishing") as SearchFilters["furnishing"])  ?? "",
    amenities:        searchParams.get("amenities")?.split(",").filter(Boolean) ?? [],
    gender_preference:(searchParams.get("gender") as SearchFilters["gender_preference"]) ?? "",
    max_distance:     searchParams.get("distance")  ? Number(searchParams.get("distance")) : undefined,
    is_available:     searchParams.get("available") === "true" ? true : undefined,
    sort_by:          (searchParams.get("sort") as SortOption) ?? "newest",
    page:             searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    per_page:         searchParams.get("per_page") ? Number(searchParams.get("per_page")) : 12,
  }), [searchParams]);

  const [filters, setFilters] = useState<SearchFilters>(initFilters);

  // Fetch listings from API
  const fetchListings = useCallback(async (f: SearchFilters) => {
    setLoading(true);
    try {
      const params = filtersToParams(f);
      const res = await fetch(`/api/listings?${params.toString()}`);
      const json: PaginatedResult<Property> = await res.json();
      setResult(json);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL → state on mount & URL change
  useEffect(() => {
    const f = initFilters();
    setFilters(f);
    fetchListings(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const applyFilters = useCallback((f: SearchFilters, newPage = 1) => {
    const updated = { ...f, page: newPage };
    setFilters(updated);
    const params = filtersToParams(updated);
    startTransition(() => router.push(`/listings?${params.toString()}`, { scroll: false }));
  }, [router]);

  const handleReset = () => {
    const blank: SearchFilters = { sort_by: "newest", page: 1, per_page: filters.per_page };
    setFilters(blank);
    startTransition(() => router.push("/listings", { scroll: false }));
  };

  const handleSortChange = (sort: SortOption) => applyFilters({ ...filters, sort_by: sort });
  const handlePageChange  = (page: number)     => applyFilters(filters, page);
  const handlePerPage     = (pp: number)        => applyFilters({ ...filters, per_page: pp }, 1);

  const handleFavoriteToggle = (id: string, state: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      state ? next.add(id) : next.delete(id);
      return next;
    });
    // POST/DELETE /api/favorites/:id
    fetch(`/api/favorites/${id}`, { method: state ? "POST" : "DELETE" }).catch(() => {});
  };

  const activeCount = countActiveFilters(filters);
  const properties  = (result?.data ?? []).map((p) => ({
    ...p,
    is_favorited: favorites.has(p.id),
  }));

  return (
    <div className="min-h-screen bg-[var(--background-muted)]">
      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-[var(--shadow-xs)]">
        <div className="container-site py-3">
          <div className="flex items-center gap-3 flex-wrap">

            {/* Search input */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
              <Search className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
              <input
                type="text"
                placeholder="Search property name, location..."
                value={filters.query ?? ""}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
                className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--foreground-subtle)] outline-none text-sm"
              />
              {filters.query && (
                <button onClick={() => { setFilters({ ...filters, query: "" }); applyFilters({ ...filters, query: "" }); }}>
                  <X className="w-3.5 h-3.5 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]" />
                </button>
              )}
            </div>

            {/* Area quick-select */}
            <div className="relative hidden sm:flex items-center">
              <MapPin className="absolute left-3 w-4 h-4 text-green-500 pointer-events-none" />
              <select
                value={filters.area ?? ""}
                onChange={(e) => applyFilters({ ...filters, area: e.target.value })}
                className="pl-9 pr-7 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">All Areas</option>
                {MACHAKOS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[var(--foreground-subtle)] pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative hidden md:flex items-center">
              <ArrowUpDown className="absolute left-3 w-4 h-4 text-[var(--foreground-subtle)] pointer-events-none" />
              <select
                value={filters.sort_by ?? "newest"}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="pl-9 pr-7 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[var(--foreground-subtle)] pointer-events-none" />
            </div>

            {/* Mobile: filters button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                "lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                activeCount > 0
                  ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-600"
                  : "border-[var(--border)] text-[var(--foreground-muted)]"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Search CTA */}
            <button
              onClick={() => applyFilters(filters)}
              className="btn btn-primary btn-sm shrink-0"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2 rounded-lg transition-all", view === "grid" ? "bg-[var(--background)] shadow-sm text-green-600" : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]")}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2 rounded-lg transition-all", view === "list" ? "bg-[var(--background)] shadow-sm text-green-600" : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]")}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="container-site py-8">
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onApply={() => applyFilters(filters)}
            onReset={handleReset}
            activeCount={activeCount}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips */}
            <ActiveFilters
              filters={filters}
              onChange={(f) => applyFilters(f)}
              onReset={handleReset}
            />

            {/* Results header */}
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div>
                {loading ? (
                  <div className="h-5 w-40 skeleton rounded" />
                ) : (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    <span className="font-bold text-[var(--foreground)] text-base">{result?.total ?? 0}</span>
                    {" "}properties found
                    {filters.area && <span className="text-green-600 font-medium"> in {filters.area}</span>}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile sort */}
                <div className="relative md:hidden flex items-center">
                  <select
                    value={filters.sort_by ?? "newest"}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="pl-3 pr-7 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs outline-none appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 w-3 h-3 text-[var(--foreground-subtle)] pointer-events-none" />
                </div>

                {/* Per-page */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <span>Show</span>
                  <div className="flex gap-1">
                    {PER_PAGE_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => handlePerPage(n)}
                        className={cn(
                          "w-8 h-7 rounded-lg text-xs font-semibold transition-all",
                          filters.per_page === n
                            ? "bg-green-600 text-white"
                            : "bg-[var(--muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid / List */}
            {loading ? (
              <ListingPageSkeleton />
            ) : properties.length === 0 ? (
              <NoListingsEmpty />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${view}-${filters.page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    view === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  )}
                >
                  {properties.map((property, i) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                    >
                      {view === "grid" ? (
                        <PropertyCard
                          property={property}
                          index={i}
                        />
                      ) : (
                        <PropertyListCard
                          property={property}
                          onFavoriteToggle={handleFavoriteToggle}
                        />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {result && (
              <PaginationBar
                page={result.page}
                totalPages={result.total_pages}
                total={result.total}
                perPage={result.per_page}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onApply={() => applyFilters(filters)}
        onReset={handleReset}
        activeCount={activeCount}
      />
    </div>
  );
}
