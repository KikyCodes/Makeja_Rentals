"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, ShieldCheck, Camera, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_PROFILE = {
  full_name: "Grace Mwende",
  email: "grace@example.com",
  phone: "+254712345678",
  role: "tenant" as const,
  is_verified: false,
  avatar_url: null as string | null,
};

export default function ProfileClient() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Supabase update: await supabase.from("profiles").update(profile).eq("id", userId)
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Profile updated!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-8">My Profile</h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6"
        >
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-black">
                {profile.full_name.charAt(0)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-green-50 transition-colors">
                <Camera className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{profile.full_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{profile.role}</p>
              {profile.is_verified ? (
                <p className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Account
                </p>
              ) : (
                <button className="text-xs text-amber-600 font-medium mt-1 hover:underline">
                  Request Verification →
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-green-500 transition-all">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="flex-1 bg-transparent text-slate-800 dark:text-white outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 opacity-60">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input value={profile.email} readOnly className="flex-1 bg-transparent text-slate-800 dark:text-white outline-none text-sm cursor-not-allowed" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Phone Number</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-green-500 transition-all">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+254 700 000 000"
                  className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
