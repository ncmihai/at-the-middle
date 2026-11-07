"use client";

import * as React from "react";
import { CheckIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { messages } from "@/lib/messages";
import { Button } from "@/components/ui/button";

export default function ShareButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = React.useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/r/${slug}`;
  }, [slug]);

  const markCopied = () => {
    setCopied(true);
    toast.success(messages.results.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      markCopied();
    } catch {
      // clipboard API unavailable (e.g. insecure context) — legacy fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
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
      title={shareUrl}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-success" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
      {messages.results.share}
    </Button>
  );
}
