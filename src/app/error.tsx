"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to error monitoring (Sentry, etc.)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          An unexpected error occurred. Our team has been notified and is working on a fix.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 mb-6 font-mono text-left break-all">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6">Error ID: {error.digest}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
