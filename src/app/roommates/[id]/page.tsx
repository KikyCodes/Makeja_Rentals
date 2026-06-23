import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Calendar, ShieldCheck, ArrowLeft, Users,
  Cigarette, PawPrint, Moon, Sun, Sparkles, Coffee,
  MessageCircle, Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import type { RoommatePost } from "@/types";
import RoommateDetailConnectButton from "@/components/roommates/RoommateDetailConnectButton";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("roommate_posts")
    .select("title, area, description")
    .eq("id", id)
    .single();

  if (!data) {
    return { title: "Roommate Profile Not Found — Makeja Rentals" };
  }

  return {
    title: `${data.title} — Makeja Rentals`,
    description: data.description?.slice(0, 160),
  };
}

const AVATAR_GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-green-400 to-emerald-500",
  "from-orange-400 to-red-500",
];

const GENDER_LABEL: Record<string, string> = {
  any: "Open to all",
  male: "Male only",
  female: "Female only",
};

function InfoBadge({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${color ?? "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
      <span className="shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] opacity-60 leading-none mb-0.5">{label}</p>
        <p className="font-semibold text-xs leading-none">{value}</p>
      </div>
    </div>
  );
}

export default async function RoommateDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roommate_posts")
    .select(
      `
      *,
      user:profiles (
        id, full_name, avatar_url, is_verified, role, created_at
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const post = data as RoommatePost;
  const initials =
    post.user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  // Get current user for showing connect button
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === post.user_id;

  const lifestyleInfo: { icon: React.ReactNode; label: string; value: string; color?: string }[] = [
    {
      icon: <Cigarette className="w-4 h-4" />,
      label: "Smoking",
      value: { no: "Non-smoker", yes: "Smoker", occasionally: "Occasionally", outside_only: "Outside only" }[post.smoking_pref ?? "no"] ?? "No preference",
      color: post.smoking_pref === "no" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
    },
    {
      icon: <Coffee className="w-4 h-4" />,
      label: "Drinking",
      value: { no: "Non-drinker", yes: "Drinks", occasionally: "Occasionally" }[post.drinking_pref ?? "no"] ?? "No preference",
    },
    {
      icon: <PawPrint className="w-4 h-4" />,
      label: "Pets",
      value: { no: "No pets", yes: "Pets welcome", small_pets: "Small pets OK" }[post.pets_pref ?? "no"] ?? "No preference",
    },
    {
      icon: post.sleep_schedule === "night_owl" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      label: "Schedule",
      value: { early_bird: "Early bird", night_owl: "Night owl", flexible: "Flexible" }[post.sleep_schedule ?? "flexible"] ?? "Flexible",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Cleanliness",
      value: { very_clean: "Very clean", clean: "Clean", moderate: "Moderate", relaxed: "Relaxed" }[post.cleanliness ?? "clean"] ?? "Clean",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Back nav */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/roommates"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roommates
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Profile card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden sticky top-24">
                {/* Photo header */}
                <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-700 relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_120%,white,transparent)]" />
                  <div className="absolute bottom-0 left-6 translate-y-1/2">
                    <div className="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-slate-900 overflow-hidden shadow-lg">
                      {post.profile_photo_url ? (
                        <Image
                          src={post.profile_photo_url}
                          alt={post.user?.full_name ?? ""}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${AVATAR_GRADIENTS[0]} flex items-center justify-center text-white font-bold text-2xl`}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-14 px-6 pb-6 space-y-3">
                  {/* Name + verification */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                        {post.user?.full_name ?? "Anonymous"}
                      </h2>
                      {(post.age || post.occupation) && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {[post.age ? `${post.age} yrs` : null, post.occupation]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    {post.user?.is_verified && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-600 text-xs font-medium">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* University */}
                  {post.university && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {post.university}
                    </p>
                  )}

                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                      {post.area}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                      Move in:{" "}
                      {new Date(post.move_in_date).toLocaleDateString("en-KE", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4 text-purple-500 shrink-0" />
                      {GENDER_LABEL[post.gender_preference] ?? "Open to all"}
                    </div>
                    {post.views_count !== undefined && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        {post.views_count} views
                      </div>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Monthly budget</p>
                    <p className="font-black text-slate-900 dark:text-white text-lg">
                      {formatPrice(post.budget_min)}{" "}
                      <span className="font-normal text-slate-400 text-base">–</span>{" "}
                      {formatPrice(post.budget_max)}
                      <span className="text-sm font-normal text-slate-400">/mo</span>
                    </p>
                  </div>

                  {/* Connect button */}
                  {!isOwner && (
                    <div className="pt-2">
                      <RoommateDetailConnectButton post={post} />
                    </div>
                  )}
                  {isOwner && (
                    <Link
                      href={`/roommates/${post.id}/edit`}
                      className="block w-full text-center px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-600 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
                    >
                      Edit your profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title + description */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h1 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                  {post.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {post.description}
                </p>
              </div>

              {/* Lifestyle preferences */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Lifestyle Preferences
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lifestyleInfo.map((item) => (
                    <InfoBadge
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      color={item.color}
                    />
                  ))}
                </div>
              </div>

              {/* Lifestyle tags */}
              {post.lifestyle_tags && post.lifestyle_tags.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {post.lifestyle_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact CTA */}
              {!isOwner && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-2xl border border-purple-100 dark:border-purple-900 p-6">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-2">
                    Interested in connecting?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    Send {post.user?.full_name?.split(" ")[0] ?? "them"} a message and introduce yourself.
                  </p>
                  <RoommateDetailConnectButton post={post} variant="full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
