// lib/theme.ts — dark-mode support: Light / Dark / System (default = system).
//
// The choice is persisted in the "midspot-theme" cookie so it survives reloads.
// While set to "system" the app follows prefers-color-scheme (and live OS theme
// changes). The actual switch is a single .dark class on <html> — the inline
// script in app/layout.tsx sets it BEFORE first paint (no flash), and the
// class-based Tailwind variant + the .dark token block in app/globals.css do
// the rest.
//
// This module is server-safe (no "use client", no browser APIs at module
// scope) — same pattern as lib/i18n/index.ts and lib/currency.ts: server code
// may import THEME_COOKIE/resolveTheme, client components use the useTheme()
// hook below.
import * as React from "react";

/** Cookie that stores the chosen theme (read client-side, set by <ThemeToggle/>). */
export const THEME_COOKIE = "midspot-theme";
/** window event dispatched on every theme change so all useTheme() hooks re-render. */
export const THEME_CHANGE_EVENT = "midspot:theme";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "system";

export function isTheme(value: string | null | undefined): value is Theme {
  return !!value && (THEMES as readonly string[]).includes(value);
}

/** cookie value → Theme (unknown/missing → system) */
export function resolveTheme(cookieValue?: string | null): Theme {
  return isTheme(cookieValue) ? cookieValue : DEFAULT_THEME;
}

/** Client-side cookie read (null on the server). */
export function readThemeCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

/** the OS-level preference (client only) */
function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** theme → actually-applied dark? ("system" resolves via prefers-color-scheme) */
export function themeResolvesDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark());
}

/** toggle the .dark class on <html> according to the resolved theme (client only). */
export function applyThemeClass(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", themeResolvesDark(theme));
}

/** Persist the theme choice, apply the .dark class, and notify every useTheme(). */
export function setTheme(theme: Theme): void {
  if (typeof document !== "undefined") {
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; samesite=lax`;
    applyThemeClass(theme);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
  }
}

export type UseTheme = {
  /** the chosen theme ("light" | "dark" | "system") — SSR/first render = "system" */
  theme: Theme;
  /** the theme actually applied right now ("system" resolved via prefers-color-scheme) */
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

/**
 * Current theme + setter. SSR and the FIRST client render always resolve to
 * light (no hydration mismatch — the pre-paint inline script in app/layout.tsx
 * already set the right .dark class); after mount the cookie value is read,
 * applied, and every THEME_CHANGE_EVENT switches live. While in "system" mode
 * the hook follows prefers-color-scheme change events.
 */
export function useTheme(): UseTheme {
  const [theme, setThemeState] = React.useState<Theme>(DEFAULT_THEME);
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");
  // the theme currently applied (ref so the matchMedia listener always sees it)
  const currentRef = React.useRef<Theme>(DEFAULT_THEME);

  React.useEffect(() => {
    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    const current = currentRef;
    current.current = resolveTheme(readThemeCookie());
    const apply = (t: Theme) => {
      current.current = t;
      const dark = t === "system" ? (mq?.matches ?? false) : t === "dark";
      setResolved(dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", dark);
    };
    apply(current.current);
    setThemeState(current.current);
    // OS theme changed while we're in system mode → re-resolve
    const onMqChange = () => {
      if (current.current === "system") apply("system");
    };
    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isTheme(detail)) apply(detail);
    };
    mq?.addEventListener("change", onMqChange);
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => {
      mq?.removeEventListener("change", onMqChange);
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  }, []);

  const change = React.useCallback((next: Theme) => {
    setTheme(next); // cookie + .dark class + THEME_CHANGE_EVENT
    setThemeState(next);
  }, []);

  return { theme, resolved, setTheme: change };
}
