"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap, Upload, Loader2, AlertCircle, CheckCircle2,
  X, FileImage, ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const INSTITUTIONS = [
  "Machakos University",
  "South Eastern Kenya University (SEKU)",
  "Machakos Technical University",
  "Machakos Institute of Technology",
  "Other",
];

const schema = z.object({
  institution: z.string().min(1, "Select your institution"),
  student_id: z.string().min(3, "Enter your student ID / admission number"),
  year_of_study: z.string().min(1, "Select your year of study"),
});
type FormData = z.infer<typeof schema>;

export default function StudentVerifyForm() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setServerError("Only images (JPEG, PNG) or PDF files are accepted.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setServerError("File must be under 5 MB.");
      return;
    }
    setFile(f);
    setServerError(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      setServerError("Please upload a photo of your student ID or admission letter.");
      return;
    }
    if (!user) {
      setServerError("You must be signed in to verify.");
      return;
    }

    setLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();

      // Upload ID document to Supabase Storage
      const ext = file.name.split(".").pop();
      const path = `student-ids/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("verifications")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Save verification record
      const { error: dbError } = await supabase
        .from("student_verifications")
        .upsert({
          user_id: user.id,
          institution: data.institution,
          student_id_number: data.student_id,
          year_of_study: data.year_of_study,
          document_path: path,
          status: "pending",
        });
      if (dbError) throw dbError;

      setDone(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err: unknown) {
      setServerError((err as Error).message ?? "Verification submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Verification submitted!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Our team will review your documents within 24 hours. You&apos;ll receive an email once approved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium w-fit mx-auto">
          <span>⏳</span>
          Pending review
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2.5">
        <GraduationCap className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Student verification unlocks discounted listings and increases your trust score with landlords.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Institution */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Institution
          </label>
          <select
            {...register("institution")}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none ${
              errors.institution
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            }`}
          >
            <option value="">Select your institution…</option>
            {INSTITUTIONS.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
          {errors.institution && (
            <p className="text-red-500 text-xs mt-1">{errors.institution.message}</p>
          )}
        </div>

        {/* Student ID */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Student ID / Admission No.
          </label>
          <input
            {...register("student_id")}
            placeholder="e.g. MCU/2023/001"
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 outline-none ${
              errors.student_id
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            }`}
          />
          {errors.student_id && (
            <p className="text-red-500 text-xs mt-1">{errors.student_id.message}</p>
          )}
        </div>

        {/* Year of study */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Year of study
          </label>
          <select
            {...register("year_of_study")}
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none ${
              errors.year_of_study
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            }`}
          >
            <option value="">Select year…</option>
            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters / Postgrad"].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {errors.year_of_study && (
            <p className="text-red-500 text-xs mt-1">{errors.year_of_study.message}</p>
          )}
        </div>

        {/* File upload */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Student ID card or admission letter
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-green-400 bg-green-50 dark:bg-green-950/30">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="w-12 h-12 rounded-lg object-cover border border-green-300" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-green-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 transition-colors text-slate-400 hover:text-green-600 group"
            >
              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs">JPEG, PNG, or PDF — max 5 MB</p>
              </div>
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <>Submit for Verification <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-2"
      >
        Skip for now
      </button>
    </div>
  );
}
