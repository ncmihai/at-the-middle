"use client";

// components/InviteButton.tsx — "Copy invite" button on the results page header
// (PLAN.md Faza 4 lot 6). Copies a prefilled invite message for the best
// (rank 1) result to the clipboard, in the current UI language. The text is
// built by lib/share.ts inviteText(result, url, lang) from the per-language
// template (lib/i18n results.inviteTemplate).
import * as React from "react";
import { CheckIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import type { ResultEntry } from "@/lib/types";
import { useLanguage, useMessages } from "@/lib/i18n";
import { inviteText, shareUrlFor } from "@/lib/share";
import { Button } from "@/components/ui/button";

export type InviteButtonProps = {
  /** the best (rank 1) result — the destination the invite talks about */
  result: ResultEntry;
  slug: string;
  className?: string;
};

export default function InviteButton({ result, slug, className }: InviteButtonProps) {
  const messages = useMessages();
  const [lang] = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const shareUrl = React.useMemo(() => shareUrlFor(slug), [slug]);
  const text = React.useMemo(
    () =>
      inviteText(
        {
          destinationCity: result.destinationCity,
          destinationCountry: result.destinationCountry,
          departureDate: result.departureDate,
          returnDate: result.returnDate,
          gapMinutes: result.gapMinutes,
        },
        shareUrl,
        lang
      ),
    [result, shareUrl, lang]
  );

  const markCopied = () => {
    setCopied(true);
    toast.success(messages.results.inviteCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      markCopied();
    } catch {
      // clipboard API unavailable (e.g. insecure context) — legacy fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        markCopied();
      } catch {
        toast.error(messages.results.copyFailed);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void copy()}
      className={className}
      title={text}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-success" />
      ) : (
        <UserPlusIcon className="h-4 w-4" />
      )}
      {messages.results.invite}
    </Button>
  );
}
