"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const OTP_LENGTH = 6;

export default function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const next = searchParams.get("next") ?? "/dashboard";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const focusInput = (i: number) => inputRefs.current[i]?.focus();

  const handleChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[i] = value.slice(-1);
    setDigits(next);
    if (value && i < OTP_LENGTH - 1) focusInput(i + 1);
    // Auto-submit when all filled
    if (value && next.every(Boolean)) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      focusInput(i - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
    if (pasted.length === OTP_LENGTH) handleVerify(pasted);
  };

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push(next), 1500);
    } catch (err: unknown) {
      setError("Invalid or expired code. Please try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => focusInput(0), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setCountdown(60);
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => focusInput(0), 50);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting you…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {email && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* OTP boxes */}
      <div className="flex gap-3 justify-center">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={loading}
            className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-black transition-all outline-none ${
              d
                ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            } focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:opacity-50`}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={() => handleVerify(digits.join(""))}
        disabled={loading || digits.some((d) => !d)}
        className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Verifying…" : "Verify Code"}
      </button>

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resend code in{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-2 text-sm text-green-600 font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}
