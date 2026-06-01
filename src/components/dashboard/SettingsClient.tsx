"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Bell, Shield, Phone, Mail, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    new_inquiry: true,
    booking_request: true,
    booking_confirmed: true,
    review_received: true,
    weekly_report: false,
    marketing: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name ?? "",
      phone: user?.user_metadata?.phone ?? "",
      bio: "",
    },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    setSaving(true);
    // In production: supabase.auth.updateUser({ data }) + update profiles table
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { id: "profile",       label: "Profile",       icon: User },
    { id: "notifications", label: "Notifications",  icon: Bell },
    { id: "security",      label: "Security",       icon: Shield },
  ] as const;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and notification preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-white dark:bg-slate-700 shadow text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-black">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? "L"}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{user?.user_metadata?.full_name ?? "Landlord"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <button className="text-xs text-green-600 hover:underline mt-0.5 font-medium">Change photo</button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Full Name</label>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 ${errors.full_name ? "border-red-400" : "border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"}`}>
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input {...register("full_name")} className="flex-1 bg-transparent text-slate-800 dark:text-white outline-none text-sm" />
              </div>
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Phone Number</label>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500`}>
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input {...register("phone")} placeholder="+254 7XX XXX XXX" className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea {...register("bio")} rows={3} placeholder="Tell tenants a bit about yourself…" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none transition-all" />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </motion.div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white">Email Notifications</h3>
          {([
            { key: "new_inquiry",        label: "New inquiry",           desc: "When a tenant sends you a new inquiry" },
            { key: "booking_request",    label: "Viewing request",       desc: "When a tenant requests a property viewing" },
            { key: "booking_confirmed",  label: "Booking confirmed",     desc: "Confirmation when you accept a viewing" },
            { key: "review_received",    label: "New review",            desc: "When a tenant leaves a review on your property" },
            { key: "weekly_report",      label: "Weekly performance",    desc: "A weekly summary of views, inquiries, and bookings" },
            { key: "marketing",          label: "Tips & updates",        desc: "Product updates and landlord tips from Makeja" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifPrefs[key] ? "bg-green-600" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? "translate-x-5.5 left-0.5" : "left-0.5"}`} style={{ transform: notifPrefs[key] ? "translateX(22px)" : "translateX(0)" }} />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors">
            <Save className="w-4 h-4" />Save Preferences
          </button>
        </motion.div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We&apos;ll send a password reset link to your email address.</p>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:border-green-400 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-colors">
              <Shield className="w-4 h-4" />Send Reset Link
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Account Verification</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Verify your identity to unlock all landlord features.</p>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">Email verified</p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
            <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">Once you delete your account, there is no going back.</p>
            <button className="px-5 py-2.5 border border-red-300 dark:border-red-700 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
