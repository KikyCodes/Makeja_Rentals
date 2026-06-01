"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, ShieldCheck, ShieldOff, ShieldAlert,
  CheckCircle2, Clock, Upload, ArrowRight, Home, Star,
} from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

type VerifyStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerifyItem {
  property_id: string;
  title: string;
  type: string;
  area: string;
  status: VerifyStatus;
  submitted_at?: string;
  verified_at?: string;
  note?: string;
}

const MOCK_VERIFY: VerifyItem[] = [
  { property_id: "1", title: "Modern Bedsitter Near University",   type: "Bedsitter",   area: "Machakos Town", status: "verified",   verified_at: "2025-01-10" },
  { property_id: "2", title: "Cosy Hostel Room — All Inclusive",  type: "Hostel",      area: "Machakos Town", status: "verified",   verified_at: "2025-01-08" },
  { property_id: "3", title: "Spacious 1-Bedroom Apartment",      type: "1 Bedroom",   area: "Machakos Town", status: "pending",    submitted_at: "2025-01-15", note: "Our team will visit within 48 hours." },
  { property_id: "6", title: "2-Bedroom Family Apartment",        type: "2 Bedroom",   area: "Machakos Town", status: "unverified" },
];

const STATUS_UI: Record<VerifyStatus, { label: string; cls: string; icon: React.ElementType; description: string }> = {
  verified:   { label: "Verified",   cls: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",  icon: ShieldCheck,  description: "This property has been verified by our team." },
  pending:    { label: "Pending",    cls: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",  icon: Clock,        description: "Verification is in progress. Our team will contact you soon." },
  rejected:   { label: "Rejected",   cls: "bg-red-100 dark:bg-red-950 text-red-600",                           icon: ShieldOff,    description: "Verification was rejected. Please review the feedback and resubmit." },
  unverified: { label: "Unverified", cls: "bg-slate-100 dark:bg-slate-800 text-slate-500",                     icon: ShieldAlert,  description: "Submit a verification request to build tenant trust." },
};

const BENEFITS = [
  { icon: Star,        text: "Verified badge on your listing — stands out in search" },
  { icon: CheckCircle2,text: "+40% more inquiries from students" },
  { icon: Shield,      text: "Faster bookings — tenants trust verified landlords more" },
  { icon: Home,        text: "Priority placement in featured listings" },
];

export default function VerificationClient() {
  const [items, setItems] = useState<VerifyItem[]>(MOCK_VERIFY);
  const [requesting, setRequesting] = useState<string | null>(null);

  const handleRequest = (id: string) => {
    setRequesting(id);
    setTimeout(() => {
      setItems((prev) => prev.map((v) =>
        v.property_id === id
          ? { ...v, status: "pending", submitted_at: new Date().toISOString().split("T")[0], note: "Our team will visit within 48 hours." }
          : v
      ));
      setRequesting(null);
    }, 1200);
  };

  const verified = items.filter((i) => i.status === "verified").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const unverified = items.filter((i) => i.status === "unverified").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Property Verification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Get your properties verified to increase trust and bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Verified",   value: verified,   color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900" },
          { label: "Pending",    value: pending,    color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900" },
          { label: "Unverified", value: unverified, color: "text-slate-500", bg: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 border shadow-sm ${s.bg}`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white">
        <h3 className="font-black text-lg mb-3">Why get verified?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <b.icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-green-50">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Properties list */}
      <div className="space-y-3">
        {items.map((item) => {
          const { label, cls, icon: Icon, description } = STATUS_UI[item.status];
          return (
            <motion.div
              key={item.property_id}
              layout
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.type} · {item.area}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${cls}`}>
                      <Icon className="w-3 h-3" />{label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>

                  {item.note && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-400">{item.note}</p>
                    </div>
                  )}

                  {(item.verified_at || item.submitted_at) && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      {item.verified_at ? `Verified on ${item.verified_at}` : `Submitted on ${item.submitted_at}`}
                    </p>
                  )}

                  {item.status === "unverified" && (
                    <button
                      onClick={() => handleRequest(item.property_id)}
                      disabled={requesting === item.property_id}
                      className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
                    >
                      {requesting === item.property_id ? (
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" />Submitting…</span>
                      ) : (
                        <><Upload className="w-4 h-4" />Request Verification</>
                      )}
                    </button>
                  )}

                  {item.status === "rejected" && (
                    <button
                      onClick={() => handleRequest(item.property_id)}
                      disabled={requesting === item.property_id}
                      className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-green-400 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />Resubmit Request
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Process explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">How verification works</h3>
        <div className="space-y-4">
          {[
            { step: "1", title: "Submit request",     desc: "Click 'Request Verification' on any unverified property." },
            { step: "2", title: "Team site visit",    desc: "Our team visits the property within 24–48 hours to confirm it matches the listing." },
            { step: "3", title: "Verification badge", desc: "Once approved, your listing gets a blue ✓ verified badge — instantly visible to tenants." },
            { step: "4", title: "Boost in visibility",desc: "Verified listings rank higher in search results and get priority in featured sections." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">{s.step}</div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{s.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
