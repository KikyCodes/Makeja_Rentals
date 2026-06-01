import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; href: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { container: "py-10", emoji: "text-4xl", title: "text-base", desc: "text-xs" },
  md: { container: "py-16", emoji: "text-5xl", title: "text-lg",   desc: "text-sm" },
  lg: { container: "py-24", emoji: "text-6xl", title: "text-xl",   desc: "text-base" },
};

export function EmptyState({ icon = "🏠", title, description, action, size = "md", className }: EmptyStateProps) {
  const s = sizeClasses[size];
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", s.container, className)}>
      <span className={cn(s.emoji, "mb-4 select-none animate-float")}>{icon}</span>
      <h3 className={cn("font-bold mb-2", s.title)} style={{ color: "var(--foreground)" }}>{title}</h3>
      {description && (
        <p className={cn("max-w-xs leading-relaxed mb-6", s.desc)} style={{ color: "var(--foreground-muted)" }}>
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* Pre-built empties */
export function NoListingsEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No properties found"
      description="Try adjusting your filters or search in a different area."
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
    />
  );
}

export function NoSavedEmpty() {
  return (
    <EmptyState
      icon="❤️"
      title="No saved properties yet"
      description="Heart any listing to save it here for later viewing."
      size="lg"
    />
  );
}

export function NoRoommatesEmpty() {
  return (
    <EmptyState
      icon="👥"
      title="No roommate profiles found"
      description="Be the first to post a roommate profile in this area."
    />
  );
}
