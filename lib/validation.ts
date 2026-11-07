import { z } from "zod";

// Canonical caps — keep in sync with docs/flight-data-spec.md §7.3 and docs/app-spec.md §7.
// Values are env-overridable at runtime via lib/env.ts; these are the validation bounds.

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const searchRequestSchema = z
  .object({
    origins: z
      .array(z.string().regex(IATA, "IATA code must be 3 uppercase letters"))
      .min(2)
      .max(8)
      .refine((o) => new Set(o).size === o.length, "origins must be unique"),
    windowStart: z.string().regex(DATE),
    windowEnd: z.string().regex(DATE),
    nights: z.number().int().min(1).max(30),
    budgetPerPersonEur: z.number().min(20).max(5000),
    maxFlightMinutes: z.number().int().min(30).max(24 * 60).nullable().optional(),
  })
  .refine(
    (v) => {
      const ws = new Date(v.windowStart + "T00:00:00Z");
      const we = new Date(v.windowEnd + "T00:00:00Z");
      if (Number.isNaN(ws.getTime()) || Number.isNaN(we.getTime())) return false;
      if (we <= ws) return false;
      // max 14 departure dates: windowEnd - windowStart <= 13 days
      return (we.getTime() - ws.getTime()) / 86400000 <= 13;
    },
    { message: "window must be 1..14 departure days (windowEnd - windowStart <= 13)" }
  );

export type SearchRequestInput = z.infer<typeof searchRequestSchema>;

export const airportQuerySchema = z.object({
  q: z.string().min(1).max(64),
});

export function validateSearchRequest(body: unknown) {
  return searchRequestSchema.safeParse(body);
}
