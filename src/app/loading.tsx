export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-3 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
