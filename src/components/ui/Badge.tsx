import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "gold" | "red" | "blue" | "purple" | "warm";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "warm", children, icon, dot, className }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${variant}`, className)}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-green-500":  variant === "green",
          "bg-amber-500":  variant === "gold",
          "bg-red-500":    variant === "red",
          "bg-blue-500":   variant === "blue",
          "bg-purple-500": variant === "purple",
          "bg-slate-400":  variant === "warm",
        })} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
