"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Loader2, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    role: z.enum(["tenant", "landlord"]),
    agree: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
  });

type FormData = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
];

export default function SignupForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "tenant" },
  });

  const role = watch("role");
  const password = watch("password") ?? "";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name, role: data.role },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setServerError((err as Error).message ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setServerError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setServerError((err as Error).message ?? "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Check your inbox!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          We&apos;ve sent a confirmation link to your email. Click it to activate your account.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-2 text-green-600 font-semibold text-sm hover:underline"
        >
          Back to Sign In →
        </button>
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

      {/* Role toggle */}
      <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex gap-1">
        {[
          { value: "tenant", label: "I'm a Tenant", icon: User },
          { value: "landlord", label: "I'm a Landlord", icon: Building2 },
        ].map((r) => (
          <label
            key={r.value}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
              role === r.value
                ? "bg-white dark:bg-slate-700 shadow text-green-600 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <input type="radio" value={r.value} {...register("role")} className="sr-only" />
            <r.icon className="w-4 h-4" />
            {r.label}
          </label>
        ))}
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-400">or sign up with email</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Full name
          </label>
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all bg-slate-50 dark:bg-slate-900 ${
              errors.full_name
                ? "border-red-400 ring-1 ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
            }`}
          >
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              {...register("full_name")}
              placeholder="John Kamau"
              autoComplete="name"
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
          </div>
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Password
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
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="mt-2 flex gap-3 flex-wrap">
              {PASSWORD_RULES.map((rule) => (
                <span
                  key={rule.label}
                  className={`flex items-center gap-1 text-xs ${
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

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              {...register("agree")}
              className="mt-0.5 w-4 h-4 accent-green-600 rounded"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              I agree to the{" "}
              <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-500 text-xs mt-1">{errors.agree.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Creating account…" : "Create Free Account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
