"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2,
  AlertCircle, LayoutGrid, List, SlidersHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MACHAKOS_AREAS } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import RoommateCard from "./RoommateCard";
import MessageModal from "./MessageModal";
import { computeCompatibility } from "./CompatibilityBadge";
import type { RoommatePost } from "@/types";

interface Filters {
  search: string;
  area: string;
  gender: string;
  budget_min: string;
  budget_max: string;
  smoking_pref: string;
  pets_pref: string;
  sleep_schedule: string;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  area: "",
  gender: "",
  budget_min: "",
  budget_max: "",
  smoking_pref: "",
  pets_pref: "",
  sleep_schedule: "",
};

function RoommateCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
      <div className="px-5 pb-5 pt-10 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function RoommatesClient() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<RoommatePost[]>([]);
  const [myPost, setMyPost] = useState<RoommatePost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [messageTarget, setMessageTarget] = useState<RoommatePost | null>(null);

  const fetchPosts = useCallback(
    async (f: Filters, p: number) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(p));
      if (f.area) params.set("area", f.area);
      if (f.gender) params.set("gender", f.gender);
      if (f.budget_min) params.set("budget_min", f.budget_min);
      if (f.budget_max) params.set("budget_max", f.budget_max);
      if (f.smoking_pref) params.set("smoking_pref", f.smoking_pref);
      if (f.pets_pref) params.set("pets_pref", f.pets_pref);
      if (f.sleep_schedule) params.set("sleep_schedule", f.sleep_schedule);

      try {
        const res = await fetch(`/api/roommates?${params}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Failed to load posts");
          return;
        }
        const json = await res.json();
        let data: RoommatePost[] = json.data ?? [];

        // Client-side search filter (title + description)
        if (f.search.trim()) {
          const q = f.search.toLowerCase();
          data = data.filter(
            (post) =>
              post.title.toLowerCase().includes(q) ||
              post.description.toLowerCase().includes(q) ||
              (post.area ?? "").toLowerCase().includes(q)
          );
        }

        // Compute compatibility scores if logged-in user has a post
        if (myPost) {
          data = data
            .filter((p) => p.id !== myPost.id)
            .map((p) => ({
              ...p,
              compatibility_score: computeCompatibility(myPost, p),
            }))
            .sort((a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0));
        }

        setPosts(data);
        setTotal(json.total ?? data.length);
        setTotalPages(json.total_pages ?? 1);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [myPost]
  );

  // Fetch logged-in user's own post (for compatibility)
  const fetchMyPost = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/roommates?page=1");
      if (!res.ok) return;
      const json = await res.json();
      const mine = (json.data as RoommatePost[]).find(
        (p) => p.user_id === user.id
      );
      setMyPost(mine ?? null);
    } catch {
      // Non-fatal
    }
  }, [user]);

  useEffect(() => {
    fetchMyPost();
  }, [fetchMyPost]);

  useEffect(() => {
    fetchPosts(filters, page);
  }, [fetchPosts, filters, page]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setShowFilterPanel(false);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== "search" && v !== ""
  ).length;

  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Roommate Finder
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Find Your Perfect
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                Roommate in Machakos
              </span>
            </h1>
            <p className="text-purple-200 mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Connect with students and professionals looking to share accommodation.
              Split costs, build friendships. Our compatibility algorithm helps you find
              the right match.
            </p>
            <Link
              href="/roommates/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-800 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Post Your Profile
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              placeholder="Search by name, description, area…"
              value={pendingFilters.search}
              onChange={(e) => {
                const val = e.target.value;
                setPendingFilters((f) => ({ ...f, search: val }));
                setFilters((f) => ({ ...f, search: val }));
                setPage(1);
              }}
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
            {pendingFilters.search && (
              <button
                onClick={() => {
                  setPendingFilters((f) => ({ ...f, search: "" }));
                  setFilters((f) => ({ ...f, search: "" }));
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterPanel((v) => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                showFilterPanel || activeFilterCount > 0
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-purple-700 text-xs font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                Filter Roommates
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Area</label>
                <select
                  value={pendingFilters.area}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, area: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All areas</option>
                  {MACHAKOS_AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender pref.</label>
                <select
                  value={pendingFilters.gender}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="any">Open to all</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Min budget (KES)</label>
                <input
                  type="number"
                  value={pendingFilters.budget_min}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, budget_min: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Max budget (KES)</label>
                <input
                  type="number"
                  value={pendingFilters.budget_max}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, budget_max: e.target.value }))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Smoking</label>
                <select
                  value={pendingFilters.smoking_pref}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, smoking_pref: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any</option>
                  <option value="no">Non-smoker</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="outside_only">Outside only</option>
                  <option value="yes">Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pets</label>
                <select
                  value={pendingFilters.pets_pref}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, pets_pref: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any</option>
                  <option value="no">No pets</option>
                  <option value="small_pets">Small pets OK</option>
                  <option value="yes">Pets welcome</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sleep schedule</label>
                <select
                  value={pendingFilters.sleep_schedule}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, sleep_schedule: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Any</option>
                  <option value="early_bird">Early bird</option>
                  <option value="flexible">Flexible</option>
                  <option value="night_owl">Night owl</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-red-400 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            <span className="font-bold text-slate-900 dark:text-white">{total}</span> roommate profile{total !== 1 ? "s" : ""}
            {myPost && (
              <span className="ml-2 text-purple-600 text-xs font-medium">
                · Sorted by compatibility
              </span>
            )}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <RoommateCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Failed to load posts
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{error}</p>
            <button
              onClick={() => fetchPosts(filters, page)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Loader2 className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No profiles found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Try adjusting your filters or be the first to post!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:border-purple-400 transition-colors text-sm"
              >
                Clear filters
              </button>
              <Link
                href="/roommates/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Post Your Profile
              </Link>
            </div>
          </div>
        )}

        {/* Grid / List */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-2xl"
              )}
            >
              {posts.map((post, i) => (
                <RoommateCard
                  key={post.id}
                  post={post}
                  index={i}
                  myPost={myPost}
                  onConnect={(p) => setMessageTarget(p)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-400 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span key={`ellipsis-${p}`} className="text-slate-400 text-sm">…</span>
                      )}
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors",
                          p === page
                            ? "bg-purple-600 text-white"
                            : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400"
                        )}
                      >
                        {p}
                      </button>
                    </>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-400 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA bottom */}
        {!loading && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-2xl border border-purple-100 dark:border-purple-900 p-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Looking for a roommate?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Post your profile and let compatible roommates find you.
              </p>
              <Link
                href="/roommates/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Post Your Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Message modal */}
      <MessageModal
        post={messageTarget}
        onClose={() => setMessageTarget(null)}
      />
    </main>
  );
}
