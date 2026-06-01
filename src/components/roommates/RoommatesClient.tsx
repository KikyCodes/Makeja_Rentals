"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Users, Calendar, Plus, Filter, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { MACHAKOS_AREAS } from "@/lib/utils";
import type { RoommatePost } from "@/types";

const MOCK_POSTS: RoommatePost[] = [
  {
    id: "r1", user_id: "u1",
    title: "University student looking for roommate near campus",
    description: "3rd year CS student. I keep my space clean, respect quiet hours, and love cooking. Looking for someone similar.",
    area: "Machakos Town", budget_min: 3000, budget_max: 6000,
    move_in_date: "2025-06-01",
    gender_preference: "any",
    lifestyle_tags: ["Student", "Non-smoker", "Early riser", "Clean"],
    is_active: true, created_at: new Date().toISOString(),
    user: { id: "u1", email: "b@example.com", full_name: "Brian Kamau", avatar_url: null, phone: null, role: "tenant", is_verified: true, created_at: "" },
  },
  {
    id: "r2", user_id: "u2",
    title: "Young professional seeking female roommate — Athi River",
    description: "Works at a tech firm. Looking for a mature, respectful female roommate. Budget flexible for the right person.",
    area: "Athi River", budget_min: 6000, budget_max: 10000,
    move_in_date: "2025-06-15",
    gender_preference: "female",
    lifestyle_tags: ["Professional", "Gym lover", "Non-smoker", "Quiet"],
    is_active: true, created_at: new Date().toISOString(),
    user: { id: "u2", email: "a@example.com", full_name: "Amina Juma", avatar_url: null, phone: null, role: "tenant", is_verified: false, created_at: "" },
  },
  {
    id: "r3", user_id: "u3",
    title: "Male student seeking shared room — Tala area",
    description: "1st year Engineering student. Budget is tight but I'm reliable with rent. Night classes sometimes. Flexible on move-in.",
    area: "Tala", budget_min: 2000, budget_max: 4000,
    move_in_date: "2025-07-01",
    gender_preference: "male",
    lifestyle_tags: ["Student", "Night owl", "Budget-conscious"],
    is_active: true, created_at: new Date().toISOString(),
    user: { id: "u3", email: "d@example.com", full_name: "Dennis Mutua", avatar_url: null, phone: null, role: "tenant", is_verified: true, created_at: "" },
  },
  {
    id: "r4", user_id: "u4",
    title: "Couple looking for 2-bed apartment to share — Mavoko",
    description: "Married couple, no pets, very responsible. Looking to split rent on a 2-bedroom with another couple or individual.",
    area: "Mavoko", budget_min: 8000, budget_max: 15000,
    move_in_date: "2025-06-01",
    gender_preference: "any",
    lifestyle_tags: ["Couple", "Non-smoker", "Pet-free", "Professional"],
    is_active: true, created_at: new Date().toISOString(),
    user: { id: "u4", email: "c@example.com", full_name: "Carol & James", avatar_url: null, phone: null, role: "tenant", is_verified: false, created_at: "" },
  },
];

const AVATAR_COLORS = ["from-blue-400 to-indigo-500", "from-purple-400 to-pink-500", "from-green-400 to-emerald-500", "from-orange-400 to-red-500"];
const GENDER_LABEL: Record<string, string> = { any: "Open to all", male: "Male only", female: "Female only" };

export default function RoommatesClient() {
  const [areaFilter, setAreaFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = MOCK_POSTS.filter((p) => {
    if (areaFilter && p.area !== areaFilter) return false;
    if (genderFilter && p.gender_preference !== genderFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Roommate Finder
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Find Your Perfect<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                Roommate in Machakos
              </span>
            </h1>
            <p className="text-purple-200 mb-8 max-w-xl mx-auto">
              Connect with students and professionals looking to share accommodation. Split costs, build friendships.
            </p>
            <Link
              href="/roommates/post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-800 font-bold rounded-xl hover:bg-purple-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post Your Profile
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              placeholder="Search by description, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
          </div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none"
          >
            <option value="">All Areas</option>
            {MACHAKOS_AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm outline-none"
          >
            <option value="">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Open to All</option>
          </select>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> roommate profiles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:border-purple-200 dark:hover:border-purple-800 transition-colors shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {post.user?.full_name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{post.user?.full_name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{post.area}
                    </span>
                    <span className="text-xs text-purple-600 font-medium">{GENDER_LABEL[post.gender_preference]}</span>
                  </div>
                </div>
                {post.user?.is_verified && (
                  <span className="shrink-0 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-600 text-xs font-medium">✓ Verified</span>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 leading-snug">{post.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.lifestyle_tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">Budget</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatPrice(post.budget_min)} – {formatPrice(post.budget_max)}/mo
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" /> Move in
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(post.move_in_date).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors">
                  Connect
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">👥</p>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">No profiles found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </main>
  );
}
