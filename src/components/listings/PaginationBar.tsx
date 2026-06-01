"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
}

function pageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function PaginationBar({ page, totalPages, total, perPage, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  const pages = pageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-[var(--border)]">
      <p className="text-sm text-[var(--foreground-muted)]">
        Showing <span className="font-bold text-[var(--foreground)]">{from}–{to}</span> of{" "}
        <span className="font-bold text-[var(--foreground)]">{total}</span> listings
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
            page <= 1
              ? "border-[var(--border)] text-[var(--foreground-subtle)] opacity-40 cursor-not-allowed"
              : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-500 hover:text-green-600"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Pages */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[var(--foreground-subtle)]">
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-9 h-9 rounded-xl text-sm font-semibold border transition-all",
                p === page
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-400 hover:text-green-600"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
            page >= totalPages
              ? "border-[var(--border)] text-[var(--foreground-subtle)] opacity-40 cursor-not-allowed"
              : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-green-500 hover:text-green-600"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
