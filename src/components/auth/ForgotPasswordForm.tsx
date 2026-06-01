"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setSentTo(email);
      setSent(true);
    } catch (err: unknown) {
      setServerError((err as Error).message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Email sent!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{sentTo}</span>.
            Check your inbox (and spam folder).
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-green-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Email address
          </label>
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 ${
              errors.email
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
            }`}
          >
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Link>
    </div>
  );
}
