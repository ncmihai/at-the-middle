"use client";

// ResultsList — ranked result cards on /r/[slug] (PLAN.md Faza 4 lot 2).
// Also owns the empty/partial-results state: when nothing matched, one-click
// "relax" buttons re-run POST /api/search with modified params and navigate
// to the new /r/[slug]. Selection (hover) is lifted to the page so the map
// pin highlights in sync.
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import type { ResultEntry, SearchRequest } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import ResultCard, { entryKey } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PostSearchResponse = {
  sharePath?: string;
  error?: string;
  retryAfterSeconds?: number;
};

function plusDaysUtc(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * One-click relax buttons: re-run the search with one widened parameter and
 * navigate to the new share page. Server auto-relaxes the gap to 30 h, so the
 * gap button re-submits the same params (useful after usageLimited / cache-only).
 */
export function RelaxPanel({ request }: { request: SearchRequest }) {
  const messages = useMessages();
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const run = async (key: string, patch: Partial<SearchRequest>) => {
    if (busy) return;
    setBusy(key);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...request, ...patch }),
      });
      const json = (await res.json().catch(() => ({}))) as PostSearchResponse;
      if (res.status === 429) {
        toast.error(messages.form.errors.rateLimited(json.retryAfterSeconds));
        return;
      }
      if (!res.ok || !json.sharePath) {
        toast.error(messages.form.errors.generic);
        return;
      }
      router.push(json.sharePath);
    } catch {
      toast.error(messages.form.errors.network);
    } finally {
      setBusy(null);
    }
  };

  // "+3 days window": extend windowEnd by 3 days, pulling windowStart back so the
  // span stays ≤ 13 days and windowStart stays ≥ today (server validation rules).
  const widenWindow = (): Pick<SearchRequest, "windowStart" | "windowEnd"> => {
    const today = new Date().toISOString().slice(0, 10);
    const windowEnd = plusDaysUtc(request.windowEnd, 3);
    let windowStart = request.windowStart;
    const latestStart = plusDaysUtc(windowEnd, -13);
    if (windowStart > latestStart) windowStart = latestStart;
    if (windowStart < today) windowStart = today;
    return { windowStart, windowEnd };
  };

  const buttons: { key: string; label: string; patch: () => Partial<SearchRequest> }[] = [
    { key: "gap", label: messages.results.relax.gap30, patch: () => ({}) },
    {
      key: "budget",
      label: messages.results.relax.budget50,
      patch: () => ({
        budgetPerPersonEur: Math.min(5000, request.budgetPerPersonEur + 50),
      }),
    },
    { key: "days", label: messages.results.relax.days3, patch: widenWindow },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">{messages.results.relax.title}</p>
            <p className="text-xs text-muted-foreground">{messages.results.relax.body}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {buttons.map((b) => (
            <Button
              key={b.key}
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => void run(b.key, b.patch())}
            >
              {busy === b.key && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {busy === b.key ? messages.results.relax.running : b.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export type ResultsListProps = {
  results: ResultEntry[];
  /** the original search params — enables the relax buttons on empty results */
  request?: SearchRequest;
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
};

export default function ResultsList({
  results,
  request,
  selectedKey = null,
  onSelect,
}: ResultsListProps) {
  const messages = useMessages();

  if (results.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{messages.results.empty}</p>
        {request && <RelaxPanel request={request} />}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {results.map((entry) => {
        const key = entryKey(entry);
        return (
          <ResultCard
            key={key}
            entry={entry}
            selected={key === selectedKey}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
