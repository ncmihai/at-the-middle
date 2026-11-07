"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CompassIcon,
  PlaneIcon,
} from "lucide-react";

import type { SearchResponse, SearchStatus } from "@/lib/types";
import { messages } from "@/lib/messages";
import AdsSlot from "@/components/AdsSlot";
import ResultsList from "@/components/ResultsList";
import ShareButton from "@/components/ShareButton";
import WaitingScreen from "@/components/WaitingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

const POLL_MS = 2500;
const TERMINAL_STATUSES: SearchStatus[] = ["completed", "failed", "cancelled"];

export default function SearchResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = React.useState<SearchResponse | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  React.useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      try {
        const res = await fetch(`/api/search/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (res.status === 404) {
          if (!stopped) {
            setNotFound(true);
            setData(null);
          }
          return;
        }
        if (!res.ok) {
          if (!stopped) setLoadError(`HTTP ${res.status}`);
          return;
        }
        const json = (await res.json()) as SearchResponse;
        if (stopped) return;
        setNotFound(false);
        setLoadError(null);
        setData(json);
        if (TERMINAL_STATUSES.includes(json.status) && timer) {
          clearInterval(timer);
          timer = undefined;
        }
      } catch {
        if (!stopped) setLoadError("network");
      }
    };

    void tick();
    timer = setInterval(() => void tick(), POLL_MS);
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, [slug]);

  const cancel = async () => {
    setCancelling(true);
    try {
      await fetch(`/api/search/${encodeURIComponent(slug)}/cancel`, { method: "POST" });
    } catch {
      // polling will surface the resulting state anyway
    } finally {
      setCancelling(false);
    }
  };

  const status = data?.status;
  const showWaiting = status === "queued" || status === "running";

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 md:max-w-3xl md:py-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PlaneIcon className="h-4 w-4" />
            </span>
            {messages.brand.name}
          </Link>
          {data && <ShareButton slug={slug} />}
        </header>

        {notFound && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <CompassIcon className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{messages.share.notFoundTitle}</h1>
              <p className="text-sm text-muted-foreground">{messages.share.notFoundBody}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/">{messages.share.backHome}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!notFound && !data && !loadError && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardContent className="flex flex-col gap-3 p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          </div>
        )}

        {!notFound && !data && loadError && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              {messages.share.loading} ({loadError})
            </CardContent>
          </Card>
        )}

        {data && showWaiting && (
          <WaitingScreen
            progress={data.progress}
            results={data.results}
            onCancel={() => void cancel()}
            cancelling={cancelling}
          />
        )}

        {data && status === "failed" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertTriangleIcon className="h-8 w-8 text-destructive" />
              <h1 className="text-lg font-semibold">{messages.results.failedTitle}</h1>
              {data.error && (
                <p className="text-sm text-muted-foreground">
                  {messages.share.errorPrefix}
                  {data.error}
                </p>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/">{messages.results.failedRetry}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (status === "completed" || status === "cancelled") && (
          <div className="flex flex-col gap-6">
            {status === "cancelled" && (
              <Badge variant="warning" className="w-fit">
                {messages.results.cancelledBanner}
              </Badge>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">{messages.results.title}</h1>
              <p className="text-sm text-muted-foreground">{messages.results.subtitle}</p>
              {typeof data.relaxedGapHours === "number" && (
                <p className="text-xs text-muted-foreground">
                  {messages.results.gapRelaxed(data.relaxedGapHours)}
                </p>
              )}
            </div>
            <ResultsList results={data.results} />
            {/* one ad slot after the results list — never between cards (app-spec §9) */}
            <AdsSlot position="results" />
          </div>
        )}
      </div>
      <Toaster />
    </main>
  );
}
