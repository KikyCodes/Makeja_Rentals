"use client";

import { cn } from "@/lib/utils";
import type { RoommatePost } from "@/types";

interface CompatibilityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function CompatibilityBadge({
  score,
  size = "md",
}: CompatibilityBadgeProps) {
  const color =
    score >= 80
      ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
      : score >= 60
      ? "border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400"
      : "border-slate-300 text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400";

  const sizes = {
    sm: "w-10 h-10 text-[10px]",
    md: "w-14 h-14 text-xs",
    lg: "w-20 h-20 text-sm",
  };

  const borderWidth = {
    sm: "border-2",
    md: "border-[3px]",
    lg: "border-4",
  };

  return (
    <div
      className={cn(
        "rounded-full flex flex-col items-center justify-center font-bold leading-none",
        color,
        borderWidth[size],
        sizes[size]
      )}
      title={`${score}% compatibility`}
    >
      <span>{score}%</span>
      {size !== "sm" && (
        <span className="text-[8px] font-normal opacity-70 mt-0.5">match</span>
      )}
    </div>
  );
}

/**
 * Compute compatibility between two roommate posts.
 * Returns a score 0–100.
 */
export function computeCompatibility(
  post1: RoommatePost,
  post2: RoommatePost
): number {
  let score = 0;
  let total = 0;

  // Budget overlap (30 points)
  const overlapMin = Math.max(post1.budget_min, post2.budget_min);
  const overlapMax = Math.min(post1.budget_max, post2.budget_max);
  const overlap = overlapMax - overlapMin;
  if (overlap > 0) score += 30;
  total += 30;

  // Same area (20 points)
  if (post1.area === post2.area) score += 20;
  total += 20;

  // Lifestyle tags overlap (25 points)
  const tags1 = post1.lifestyle_tags ?? [];
  const tags2 = post2.lifestyle_tags ?? [];
  const shared = tags1.filter((t) => tags2.includes(t));
  score += Math.min(25, shared.length * 8);
  total += 25;

  // Smoking pref (10 points)
  const sp1 = post1.smoking_pref ?? "no";
  const sp2 = post2.smoking_pref ?? "no";
  if (sp1 === sp2) score += 10;
  total += 10;

  // Sleep schedule (10 points)
  const ss1 = post1.sleep_schedule ?? "flexible";
  const ss2 = post2.sleep_schedule ?? "flexible";
  if (ss1 === ss2 || ss1 === "flexible" || ss2 === "flexible") score += 10;
  total += 10;

  // Gender preference compatible (5 points)
  if (
    post1.gender_preference === "any" ||
    post2.gender_preference === "any"
  ) {
    score += 5;
  }
  total += 5;

  return Math.round((score / total) * 100);
}
