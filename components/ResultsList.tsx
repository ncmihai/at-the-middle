import type { ResultEntry } from "@/lib/types";
import { messages } from "@/lib/messages";
import ResultCard from "@/components/ResultCard";

export default function ResultsList({ results }: { results: ResultEntry[] }) {
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
