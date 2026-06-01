"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
];

export default function ResetPasswordForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password") ?? "";

  const onSubmit = async ({ password }: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: unknown) {
      setServerError((err as Error).message ?? "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password updated!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Redirecting you to your dashboard…
        </p>
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
        {/* New password */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            New password
          </label>
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 ${
              errors.password
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
            }`}
          >
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2 flex gap-3 flex-wrap">
              {PASSWORD_RULES.map((rule) => (
                <span
                  key={rule.label}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    rule.test(password) ? "text-green-600" : "text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {rule.label}
                </span>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Confirm new password
          </label>
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 ${
              errors.confirm
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
            }`}
          >
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              {...register("confirm")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirm && (
            <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
