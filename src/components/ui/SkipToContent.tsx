"use client";

/**
 * SkipToContent — WCAG 2.1 AA accessibility requirement.
 * Renders a visually hidden link that becomes visible on keyboard focus.
 * Allows keyboard/screen-reader users to skip the navbar and jump to main content.
 *
 * Usage: Place as the FIRST child of <body> in layout.tsx
 * Pair with: <main id="main-content"> on your page's main content wrapper
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        fixed top-2 left-2 z-[9999]
        bg-emerald-600 text-white
        px-4 py-2 rounded-lg
        text-sm font-semibold
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}
