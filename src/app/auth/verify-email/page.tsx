import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Check Your Email — Makeja Rentals",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Check your inbox</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your account and start finding your perfect home.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-left space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Didn&apos;t receive the email?</p>
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
