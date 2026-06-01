import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type SpinnerSize = "xs" | "sm" | "md" | "lg";
const sizeMap: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Spinner({ size = "md", className }: { size?: SpinnerSize; className?: string }) {
  return <Loader2 className={cn("animate-spin text-[var(--primary)]", sizeMap[size], className)} />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">🏠</span>
          </div>
        </div>
        <div className="dot-loader flex gap-1.5" style={{ color: "var(--primary)" }}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export function InlineLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-6 justify-center" style={{ color: "var(--foreground-muted)" }}>
      <Spinner size="sm" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
