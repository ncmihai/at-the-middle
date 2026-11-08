"use client";

import * as React from "react";

import {
  CONSENT_CHANGE_EVENT,
  CONSENT_KEY,
  CONSENT_OPEN_EVENT,
  useMessages,
  type ConsentValue,
} from "@/lib/i18n";
import { Button } from "@/components/ui/button";

/**
 * GDPR cookie-consent banner — fixed at the bottom, NON-blocking (no overlay, the
 * page stays fully usable). Shown until a choice is stored in localStorage under
 * "midspot-consent" ("all" | "essential"). The footer "Cookie settings" button
 * re-opens it via the CONSENT_OPEN_EVENT window event. SSR renders nothing.
 */
export default function ConsentBanner() {
  const messages = useMessages();
  const [visible, setVisible] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  // keep the banner from covering page content (e.g. the submit button) while visible:
  // pad the body by the banner height so everything stays clickable above it
  React.useEffect(() => {
    if (!visible) return;
    const el = bannerRef.current;
    if (!el) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = `${el.offsetHeight + 8}px`;
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [visible]);

  React.useEffect(() => {
    const hasChoice = () => {
      try {
        return window.localStorage.getItem(CONSENT_KEY) !== null;
      } catch {
        return true; // storage unavailable → don't nag
      }
    };
    setVisible(!hasChoice());
    const onOpen = () => setVisible(true);
    const onChange = () => setVisible(!hasChoice());
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    };
  }, []);

  const choose = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // storage blocked — still close the banner for this visit
    }
    setVisible(false);
    window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_CHANGE_EVENT, { detail: value }));
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80"
      role="region"
      aria-label={messages.consent.title}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold">{messages.consent.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {messages.consent.body}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => choose("essential")}>
            {messages.consent.essentialOnly}
          </Button>
          <Button type="button" size="sm" onClick={() => choose("all")}>
            {messages.consent.acceptAll}
          </Button>
        </div>
      </div>
    </div>
  );
}
