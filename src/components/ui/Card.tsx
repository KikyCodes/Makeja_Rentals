import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" };

export function Card({ variant = "default", padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card",
        variant === "flat" && "card-flat",
        variant === "interactive" && "card-interactive",
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-bold text-base", className)} style={{ color: "var(--foreground)" }} {...props}>
      {children}
    </h3>
  );
}

export function CardSection({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-5 border-t", className)} style={{ borderColor: "var(--border)" }} {...props}>
      {children}
    </div>
  );
}

export function StatCard({
  label, value, icon, change, color = "green", className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  color?: "green" | "gold" | "blue" | "purple" | "red";
  className?: string;
}) {
  const bg = {
    green:  "bg-green-50  dark:bg-green-950/40  text-green-600  dark:text-green-400",
    gold:   "bg-amber-50  dark:bg-amber-950/40  text-amber-600  dark:text-amber-400",
    blue:   "bg-blue-50   dark:bg-blue-950/40   text-blue-600   dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
    red:    "bg-red-50    dark:bg-red-950/40    text-red-500    dark:text-red-400",
  }[color];

  return (
    <Card className={className}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bg)}>
        <span className="w-5 h-5">{icon}</span>
      </div>
      <p className="text-2xl font-black" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>{label}</p>
      {change && (
        <p className={cn("text-xs font-semibold mt-1.5", change.startsWith("+") ? "text-green-600" : "text-red-500")}>
          {change} this month
        </p>
      )}
    </Card>
  );
}
