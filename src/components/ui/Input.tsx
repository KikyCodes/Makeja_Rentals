import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, onRightIconClick, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {label}
          </label>
        )}
        <div className={cn("input-wrapper", leftIcon && "has-icon-left", rightIcon && "has-icon-right")}>
          {leftIcon && <span className="input-icon-left w-4 h-4">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn("input-base", error && "input-error", className)}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="input-icon-right w-4 h-4 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

/* Textarea */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn("input-base resize-none", error && "input-error", className)}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/* Select */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, leftIcon, className, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {label}
          </label>
        )}
        <div className={cn("input-wrapper relative", leftIcon && "has-icon-left")}>
          {leftIcon && <span className="input-icon-left w-4 h-4">{leftIcon}</span>}
          <select
            ref={ref}
            id={inputId}
            className={cn("input-base pr-10 cursor-pointer", error && "input-error", className)}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground-subtle)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
