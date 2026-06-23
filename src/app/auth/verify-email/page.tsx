"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Home, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const verified = searchParams.get("verified") === "true";
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";

  const [countdown, setCountdown] = useState(5);

  // Auto-redirect on success
  useEffect(() => {
    if (!verified) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace(next);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [verified, next, router]);

  // ── Success state ──────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your email address has been confirmed. Welcome to Makeja Rentals!
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/50 rounded-2xl p-5 border border-green-100 dark:border-green-900">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Redirecting in {countdown}s…</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              Taking you to your dashboard automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={next}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    const friendlyError =
      error === "invalid_link"
        ? "This verification link is invalid or has already been used."
        : error === "otp_expired"
        ? "This verification link has expired. Please request a new one."
        : decodeURIComponent(error);

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {friendlyError}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-left space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              What you can do:
            </p>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                Request a new verification link from the sign-in page
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                Links expire after 24 hours — check the email date
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                Make sure you&apos;re using the most recent email we sent
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Default: "check your inbox" state ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Check your inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We&apos;ve sent a confirmation link to your email address. Click it to activate
            your account and start finding your perfect home.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-left space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Didn&apos;t receive the email?
          </p>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              Make sure you entered the correct email
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              Links expire after 24 hours
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-green-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
