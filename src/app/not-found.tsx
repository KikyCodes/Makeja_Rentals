import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-100 dark:text-slate-800 mb-4">404</div>
        <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-6">
          <Home className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          This page doesn&apos;t exist. Maybe the listing was removed or the link is wrong.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-green-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
