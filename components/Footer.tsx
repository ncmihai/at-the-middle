"use client";

import Link from "next/link";
import { PlaneIcon } from "lucide-react";

import { CONSENT_OPEN_EVENT, useMessages } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";

/**
 * Site footer rendered in the root layout: brand, the /destinations SEO index,
 * legal links (/privacy, /terms — PLAN.md Faza 3 "pagini legale obligatorii
 * înainte de lansare"), a "Cookie settings" button that re-opens the consent
 * banner, and the language switcher.
 */
export default function Footer() {
  const messages = useMessages();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-6 text-sm text-muted-foreground md:max-w-3xl">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PlaneIcon className="h-3.5 w-3.5" />
          </span>
          {messages.footer.copyright(year)}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/destinations" className="hover:text-foreground hover:underline">
            {messages.footer.destinations}
          </Link>
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            {messages.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            {messages.footer.terms}
          </Link>
          <button
            type="button"
            className="hover:text-foreground hover:underline"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
            }
          >
            {messages.footer.cookieSettings}
          </button>
          <LangSwitcher />
        </nav>
      </div>
    </footer>
  );
}
