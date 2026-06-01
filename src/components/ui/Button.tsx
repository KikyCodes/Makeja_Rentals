import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger" | "outline-green";
type Size    = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantMap: Record<Variant, string> = {
  primary:       "btn-primary",
  secondary:     "btn-secondary",
  ghost:         "btn-ghost",
  gold:          "btn-gold",
  danger:        "btn-danger",
  "outline-green": "btn-outline-green",
};
const sizeMap: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn("btn", variantMap[variant], sizeMap[size], fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
);
Button.displayName = "Button";
