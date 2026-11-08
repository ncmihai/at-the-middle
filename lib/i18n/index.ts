// i18n module — single place for all UI copy (docs/app-spec.md §6.5, PLAN.md
// "Faza 3 — consens": en, ro, de, fr, es, it via a cookie + language switcher,
// NO routing change).
//
// en is the source of truth; the other files keep the same key structure.
//
// useMessages() reads the "midspot-lang" cookie (set by <LangSwitcher/> via
// setLanguage()), falling back to the navigator.language prefix, then to English.
// SSR and the first client render always use English (no hydration mismatch);
// after mount the hook switches to the stored/detected language and re-renders,
// and every language switch re-renders the whole page in place.
//
// This module is server-safe: it has no "use client" directive and only plain
// data at module level, so server components (layout/page metadata) can import
// getMessages()/resolveLanguage() from it; the hooks below are only ever called
// from client components.
import * as React from "react";

import { en, type LangMessages } from "./en";
import { ro } from "./ro";
import { de } from "./de";
import { fr } from "./fr";
import { es } from "./es";
import { it } from "./it";

export type { LangMessages, LegalContent, LegalDoc, LegalSection, Messages, InviteArgs } from "./en";
export { en };

/** Cookie that stores the chosen language (read client-side, set by LangSwitcher). */
export const LANG_COOKIE = "midspot-lang";
/** window event dispatched on every language change so all hooks re-render. */
export const LANG_CHANGE_EVENT = "midspot:lang";
/** localStorage key for the cookie-consent choice ("all" | "essential"). */
export const CONSENT_KEY = "midspot-consent";
/** window event dispatched when the consent choice changes. */
export const CONSENT_CHANGE_EVENT = "midspot:consent";
/** window event dispatched by the footer "Cookie settings" button to reopen the banner. */
export const CONSENT_OPEN_EVENT = "midspot:consent-open";
export type ConsentValue = "all" | "essential";

export const SUPPORTED_LANGUAGES = ["en", "ro", "de", "fr", "es", "it"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";

/** Native names for the switcher. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ro: "Română",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
};

export const messagesByLang: Record<Language, LangMessages> = { en, ro, de, fr, es, it };

export function isLanguage(value: string | null | undefined): value is Language {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** cookie value → navigator prefix → English */
export function resolveLanguage(
  cookieValue?: string | null,
  navigatorLanguage?: string | null
): Language {
  if (isLanguage(cookieValue)) return cookieValue;
  const prefix = (navigatorLanguage ?? "").split("-")[0]?.toLowerCase() ?? "";
  if (isLanguage(prefix)) return prefix;
  return DEFAULT_LANGUAGE;
}

export function getMessages(lang: Language): LangMessages {
  return messagesByLang[lang] ?? en;
}

/** Client-side cookie read (null on the server). */
export function readLangCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

/** Client-side consent read (null on the server or when undecided). */
export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Persist the language choice and notify every useMessages()/useLanguage() on the
 * page — re-render only, no routing change. Also updates document.documentElement.lang.
 */
export function setLanguage(lang: Language): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = lang;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Language>(LANG_CHANGE_EVENT, { detail: lang }));
  }
}

/**
 * Current language + setter. First render is always English (SSR-safe); the real
 * value (cookie → navigator prefix → en) is applied after mount, and every
 * LANG_CHANGE_EVENT switches language live.
 */
export function useLanguage(): [Language, (lang: Language) => void] {
  const [lang, setLang] = React.useState<Language>(DEFAULT_LANGUAGE);

  React.useEffect(() => {
    setLang(
      resolveLanguage(
        readLangCookie(),
        typeof navigator !== "undefined" ? navigator.language : null
      )
    );
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isLanguage(detail)) setLang(detail);
    };
    window.addEventListener(LANG_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, onChange);
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const change = React.useCallback((next: Language) => {
    setLanguage(next);
    setLang(next);
  }, []);

  return [lang, change];
}

/** All UI copy for the current language — re-renders on every language switch. */
export function useMessages(): LangMessages {
  const [lang] = useLanguage();
  return getMessages(lang);
}
