"use client";

import * as React from "react";

import { useMessages } from "@/lib/i18n";
import { THEMES, useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Inline SVG icons (lucide paths, no new deps — lucide-react is available, but
// the footer switchers use it; here plain SVGs keep the bundle identical).
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

const THEME_ICONS: Record<Theme, (props: { className?: string }) => React.JSX.Element> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

/**
 * Theme switcher — compact segmented control Light | Dark | System (default
 * system). Sets the "midspot-theme" cookie, toggles the .dark class on <html>
 * and re-renders every useTheme() via the "midspot:theme" window event — same
 * pattern as <LangSwitcher/>/<CurrencySwitcher/>. SSR + first client render
 * show "system" (the pre-paint inline script in app/layout.tsx already applied
 * the real theme), so no hydration mismatch.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const messages = useMessages();

  return (
    <div
      role="group"
      aria-label={messages.theme.label}
      title={messages.theme.label}
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-md border border-border bg-card p-0.5",
        className
      )}
    >
      {THEMES.map((t) => {
        const Icon = THEME_ICONS[t];
        const active = theme === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-pressed={active}
            aria-label={messages.theme[t]}
            title={messages.theme[t]}
            className={cn(
              "flex h-6 w-7 items-center justify-center rounded-[5px] transition-colors cursor-pointer",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
