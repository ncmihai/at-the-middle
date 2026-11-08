"use client";

// Copy-link share button for a blog post — same clipboard pattern as
// components/ShareButton (used for /r/[slug]), but for an arbitrary site path.
// The absolute URL is built with getSiteUrl() from lib/share.ts (env on the
// server bundle, window.location.origin in the browser).
import * as React from "react";
import { CheckIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { useMessages } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/share";
import { Button } from "@/components/ui/button";

export default function CopyLinkButton({ path }: { path: string }) {
  const messages = useMessages();
  const t = messages.blog;
  const [copied, setCopied] = React.useState(false);

  const url = React.useMemo(
    () => `${getSiteUrl().replace(/\/+$/, "")}${path}`,
    [path]
  );

  const markCopied = () => {
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      markCopied();
    } catch {
      // clipboard API unavailable (e.g. insecure context) — legacy fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        markCopied();
      } catch {
        toast.error(t.copyFailed);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void copy()}
      title={url}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-success" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
      {t.share}
    </Button>
  );
}
