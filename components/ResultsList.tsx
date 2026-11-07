"use client";

import type { ResultEntry } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import ResultCard from "@/components/ResultCard";

export default function ResultsList({ results }: { results: ResultEntry[] }) {
  const messages = useMessages();

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground">{messages.results.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {results.map((entry) => (
        <ResultCard
          key={`${entry.rank}-${entry.destinationIata}-${entry.departureDate}`}
          entry={entry}
        />
      ))}
    </div>
  );
}
