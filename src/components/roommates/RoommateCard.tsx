"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, ShieldCheck, MessageCircle, Cigarette, PawPrint,
  Moon, Sun, Sparkles,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import CompatibilityBadge from "./CompatibilityBadge";
import type { RoommatePost } from "@/types";

const AVATAR_GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-green-400 to-emerald-500",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-600",
];

const GENDER_LABEL: Record<string, string> = {
  any: "Open to all",
  male: "Male only",
  female: "Female only",
};

const GENDER_COLORS: Record<string, string> = {
  any: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  male: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  female: "bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
};

interface RoommateCardProps {
  post: RoommatePost;
  index?: number;
  onConnect?: (post: RoommatePost) => void;
  myPost?: RoommatePost | null;
}

export default function RoommateCard({
  post,
  index = 0,
  onConnect,
  myPost,
}: RoommateCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const initials =
    post.user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const avatarGradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const showPhoto = post.profile_photo_url && !imageError;

  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login?next=/roommates");
      return;
    }
    onConnect?.(post);
  };

  const lifestyleTags: { label: string; icon: React.ReactNode; color: string }[] = [];

  if (post.smoking_pref === "no") {
    lifestyleTags.push({
      label: "Non-smoker",
      icon: <Cigarette className="w-3 h-3" />,
      color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    });
  } else if (post.smoking_pref === "yes" || post.smoking_pref === "occasionally") {
    lifestyleTags.push({
      label: "Smoker",
      icon: <Cigarette className="w-3 h-3" />,
      color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
    });
  }

  if (post.pets_pref === "yes" || post.pets_pref === "small_pets") {
    lifestyleTags.push({
      label: "Pets OK",
      icon: <PawPrint className="w-3 h-3" />,
      color: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    });
  }

  if (post.sleep_schedule === "night_owl") {
    lifestyleTags.push({
      label: "Night owl",
      icon: <Moon className="w-3 h-3" />,
      color: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
    });
  } else if (post.sleep_schedule === "early_bird") {
    lifestyleTags.push({
      label: "Early bird",
      icon: <Sun className="w-3 h-3" />,
      color: "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400",
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
    >
      <Link href={`/roommates/${post.id}`} className="block group">
        <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
          {/* Avatar / photo header */}
          <div className="relative h-24 bg-gradient-to-br from-purple-600 to-indigo-700 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_120%,white,transparent)]" />
            <div className="absolute bottom-0 right-4 translate-y-1/2">
              <div className="w-16 h-16 rounded-2xl ring-4 ring-white dark:ring-slate-900 overflow-hidden shadow-lg">
                {showPhoto ? (
                  <Image
                    src={post.profile_photo_url!}
                    alt={post.user?.full_name ?? "Roommate"}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg",
                      avatarGradient
                    )}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </div>
            {/* Compatibility badge — top right */}
            {myPost && post.compatibility_score !== undefined && (
              <div className="absolute top-3 right-3">
                <CompatibilityBadge score={post.compatibility_score} size="sm" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="pt-10 px-5 pb-5 flex flex-col flex-1 gap-3">
            {/* Name + verified */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {post.user?.full_name ?? "Anonymous"}
                </p>
                {(post.age || post.occupation) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {[post.age ? `${post.age} yrs` : null, post.occupation]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              {post.user?.is_verified && (
                <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-[10px] font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {/* Location + gender pref */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                {post.area}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                  GENDER_COLORS[post.gender_preference] ??
                    GENDER_COLORS.any
                )}
              >
                {GENDER_LABEL[post.gender_preference] ?? "Open to all"}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
              {post.description}
            </p>

            {/* Lifestyle tags */}
            {lifestyleTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lifestyleTags.map((tag) => (
                  <span
                    key={tag.label}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      tag.color
                    )}
                  >
                    {tag.icon}
                    {tag.label}
                  </span>
                ))}
                {(post.lifestyle_tags ?? []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom: budget + move-in + connect */}
            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 mb-0.5">Budget</p>
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  {formatPrice(post.budget_min)} – {formatPrice(post.budget_max)}
                  <span className="font-normal text-slate-400">/mo</span>
                </p>
              </div>
              <div className="text-right min-w-0">
                <p className="text-[10px] text-slate-400 mb-0.5 flex items-center justify-end gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Move in
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(post.move_in_date).toLocaleDateString("en-KE", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Connect
              </button>
            </div>

            {/* Compatibility score bar (if available) */}
            {myPost && post.compatibility_score !== undefined && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                    Match score
                  </span>
                  <span className="text-[10px] font-bold text-purple-600">
                    {post.compatibility_score}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      post.compatibility_score >= 80
                        ? "bg-green-500"
                        : post.compatibility_score >= 60
                        ? "bg-yellow-400"
                        : "bg-slate-400"
                    )}
                    style={{ width: `${post.compatibility_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
