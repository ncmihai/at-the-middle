"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CompassIcon,
  PlaneIcon,
} from "lucide-react";

import type { ResultEntry, SearchResponse, SearchStatus } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CANDIDATES_BY_IATA } from "@/db/candidates";
import AdsSlot from "@/components/AdsSlot";
import ResultsList from "@/components/ResultsList";
import ResultsMap, {
  type MapDestinationPin,
  type MapOriginPin,
} from "@/components/ResultsMap";
import ResultsToolbar, {
  DEFAULT_TOOLBAR,
  type ToolbarState,
} from "@/components/ResultsToolbar";
import { entryKey, maxPricePerPerson } from "@/components/ResultCard";
import InviteButton from "@/components/InviteButton";
import { setHistoryTopDestination } from "@/components/RecentSearches";
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
  const messages = useMessages();
  const [data, setData] = React.useState<SearchResponse | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  /** hovered/selected result — lifted so the map pin highlights in sync */
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [toolbar, setToolbar] = React.useState<ToolbarState>(DEFAULT_TOOLBAR);

  // client-side sort/filter over the fetched results (Faza 4 lot 2)
  const visibleResults = React.useMemo<ResultEntry[]>(() => {
    const all = data?.results ?? [];
    let list = [...all];
    if (toolbar.maxGapHours != null) {
      const cap = toolbar.maxGapHours * 60;
      list = list.filter((e) => e.gapMinutes <= cap);
    }
    if (toolbar.maxPriceEur != null) {
      const cap = toolbar.maxPriceEur;
      list = list.filter((e) => maxPricePerPerson(e) <= cap);
    }
    switch (toolbar.sort) {
      case "price":
        list.sort((a, b) => a.totalPriceEur - b.totalPriceEur);
        break;
      case "destination":
        list.sort((a, b) => a.destinationCity.localeCompare(b.destinationCity));
        break;
      default:
        // gap asc (server ranking), then price asc
        list.sort((a, b) => a.gapMinutes - b.gapMinutes || a.totalPriceEur - b.totalPriceEur);
    }
    return list;
  }, [data, toolbar]);

  // best (rank 1) result of the whole search — passed down so ResultsList can wire
  // the downloadable share card (Faza 4 lot 4); independent of the toolbar sort/filter
  const bestResult = React.useMemo<ResultEntry | null>(() => {
    const all = data?.results ?? [];
    return all.find((r) => r.rank === 1) ?? all[0] ?? null;
  }, [data]);

  // Faza 4 lot 6: remember the rank-1 destination in this slug's local history entry
  React.useEffect(() => {
    if (bestResult) setHistoryTopDestination(slug, bestResult.destinationIata);
  }, [bestResult, slug]);

  const priceCap = React.useMemo(() => {
    const all = data?.results ?? [];
    const fromResults = all.reduce((m, e) => Math.max(m, maxPricePerPerson(e)), 0);
    return Math.max(fromResults, data?.request?.budgetPerPersonEur ?? 0, 1);
  }, [data]);

  // map pins: origins from the echoed request coords, destinations from the candidate shortlist
  const mapOrigins = React.useMemo<MapOriginPin[]>(() => {
    const req = data?.request;
    if (!req) return [];
    return req.origins
      .map((iata) => {
        const c = data?.originCoords?.[iata];
        return c ? { iata, latitude: c.latitude, longitude: c.longitude } : null;
      })
      .filter((p): p is MapOriginPin => p !== null);
  }, [data]);

  const mapDestinations = React.useMemo<MapDestinationPin[]>(() => {
    const seen = new Set<string>();
    const pins: MapDestinationPin[] = [];
    for (const e of data?.results ?? []) {
      if (seen.has(e.destinationIata)) continue;
      const c = CANDIDATES_BY_IATA[e.destinationIata];
      if (!c) continue;
      seen.add(e.destinationIata);
      pins.push({
        iata: e.destinationIata,
        label: e.destinationCity,
        latitude: c.latitude,
        longitude: c.longitude,
      });
    }
    return pins;
  }, [data]);

  const selectedEntry = React.useMemo(
    () => data?.results.find((r) => entryKey(r) === selectedKey) ?? null,
    [data, selectedKey]
  );

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
          <div className="flex items-center gap-2">
            {data && <ShareButton slug={slug} />}
            {/* Faza 4 lot 6: prefilled invite for the best result, next to the share link */}
            {data && bestResult && <InviteButton result={bestResult} slug={slug} />}
          </div>
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
            request={data.request}
            usageLimited={data.usageLimited}
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
              {data.usageLimited && (
                <p className="text-xs text-muted-foreground">
                  {messages.results.usageLimited}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4 md:grid md:grid-cols-5 md:items-start">
              {data.request && mapOrigins.length + mapDestinations.length > 0 && (
                <div className="md:sticky md:top-6 md:col-span-2">
                  <ResultsMap
                    origins={mapOrigins}
                    destinations={mapDestinations}
                    selectedIata={selectedEntry?.destinationIata ?? null}
                    onSelectIata={(iata) => {
                      const e = data.results.find((r) => r.destinationIata === iata);
                      setSelectedKey(e ? entryKey(e) : null);
                    }}
                  />
                </div>
              )}
              <div
                className={cn(
                  "flex flex-col gap-4",
                  data.request && mapOrigins.length + mapDestinations.length > 0
                    ? "md:col-span-3"
                    : "md:col-span-5"
                )}
              >
                {data.results.length > 0 && (
                  <ResultsToolbar
                    value={toolbar}
                    onChange={setToolbar}
                    priceCap={priceCap}
                    shown={visibleResults.length}
                    total={data.results.length}
                  />
                )}
                <ResultsList
                  results={visibleResults}
                  request={data.request}
                  usageLimited={data.usageLimited}
                  selectedKey={selectedKey}
                  onSelect={setSelectedKey}
                  bestResult={bestResult}
                  slug={slug}
                />
                {/* one ad slot after the results list — never between cards (app-spec §9) */}
                <AdsSlot position="results" />
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  );
}
