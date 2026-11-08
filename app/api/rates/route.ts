// GET /api/rates — ECB reference rates (via Frankfurter) for the 15 supported
// display currencies, base EUR. Serves the client useCurrency() hook.
//   { base, date, rates } — cached by the browser (s-maxage=3600 + SWR) and
//   in module memory for 24 h inside lib/currency.getRates().
// Optional ?cur=CODE validates a single code: 400 { error, supported } when
// unknown, otherwise the response also echoes { currency, rate } for it.
import { NextRequest, NextResponse } from "next/server";

import { CURRENCY_CODES, getRates, isCurrencyCode } from "@/lib/currency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cur = request.nextUrl.searchParams.get("cur");
  if (cur != null && !isCurrencyCode(cur)) {
    return NextResponse.json(
      { error: "unknown_currency", supported: CURRENCY_CODES },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }
  const rates = await getRates();
  return NextResponse.json(
    {
      base: rates.base,
      date: rates.date,
      rates: rates.rates,
      ...(cur ? { currency: cur, rate: rates.rates[cur] ?? 1 } : {}),
    },
    {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
