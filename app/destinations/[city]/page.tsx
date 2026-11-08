// /destinations/[city] — one SEO landing page per destination city (top 120 by
// airport count, derived from db/candidates.ts — see ../cities.ts).
//
// ISR: generateStaticParams prerenders all city pages at build; revalidate =
// 3600 regenerates them hourly so the "times chosen as a middle" stat (results
// ⨝ searches, last 90 days, aggregate counts only) stays fresh. dynamicParams
// = false → unknown slugs 404.
//
// Metadata is per city and stays English (same pattern as / — the layout title
// template appends "· midspot"); all visible copy is localized client-side via
// the destinations.* i18n namespace in ./CityView.
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WeatherStrip } from "@/components/ResultCard";
import type { CityImage } from "@/db/city-images";
import { cityPhotoForSlug } from "@/lib/city-photo";
import { en } from "@/lib/i18n";
import { fetchForecast, nextDaysRange } from "@/lib/weather";

import { DESTINATIONS_BY_SLUG, DESTINATION_SLUGS } from "../cities";
import { getChosenCountsBySlug } from "../counts";
import CityView from "./CityView";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return DESTINATION_SLUGS.map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = DESTINATIONS_BY_SLUG[slug];
  if (!city) return {};
  const meta = en.destinations.meta;
  const title = meta.cityTitle(city.city); // layout template → "Meet in X · midspot"
  const description = meta.cityDescription(city.city, city.country);
  return {
    title,
    description,
    alternates: { canonical: `/destinations/${city.slug}` },
    openGraph: {
      title: `${title} · midspot`,
      description,
      url: `/destinations/${city.slug}`,
      type: "website",
    },
  };
}

export default async function DestinationCityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = DESTINATIONS_BY_SLUG[slug];
  if (!city) notFound();
  const counts = await getChosenCountsBySlug();
  // Faza 8A/9: free city photo (Wikimedia Commons → Digi Storage mirror), null when
  // the city has no accepted photo → CityView falls back to the plain gradient hero.
  const photo: CityImage | null = cityPhotoForSlug(slug);
  // Faza 8B: "Weather in {city} — next 7 days" widget (open-meteo, free, no key).
  // Runs at build and at most once per hourly ISR revalidate per city; lib/weather.ts
  // adds a 30-min in-memory cache on top and never throws → null just hides the widget.
  const { startDate, endDate } = nextDaysRange(7);
  const forecast = await fetchForecast(city.latitude, city.longitude, startDate, endDate);
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:max-w-2xl md:py-14">
      <div className="flex flex-col gap-10">
        <CityView city={city} chosenCount={counts[city.slug] ?? 0} photo={photo} />
        {forecast && forecast.days.length > 0 && (
          <WeatherStrip city={city.city} days={forecast.days} startDate={forecast.days[0]?.date} />
        )}
      </div>
    </main>
  );
}
