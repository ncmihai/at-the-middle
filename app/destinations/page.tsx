// /destinations — SEO index of all destination cities midspot can search as a
// "middle" (derived from db/candidates.ts, see ./cities.ts). ISR: the page and
// its "times chosen as a middle" counts (results ⨝ searches, last 90 days) are
// revalidated hourly. Copy is localized client-side via the destinations.* i18n
// namespace; metadata follows the existing pattern and stays English (like /).
import type { Metadata } from "next";

import { CITY_IMAGES_BY_SLUG } from "@/db/city-images";
import { en } from "@/lib/i18n";

import DestinationsBrowser from "./DestinationsBrowser";
import { DESTINATION_CITIES, type DestinationCity } from "./cities";
import { getChosenCountsBySlug } from "./counts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: en.destinations.meta.indexTitle,
  description: en.destinations.meta.indexDescription,
  alternates: { canonical: "/destinations" },
  openGraph: {
    title: `${en.destinations.meta.indexTitle} · midspot`,
    description: en.destinations.meta.indexDescription,
    url: "/destinations",
    type: "website",
  },
};

/** Lean serializable shape passed to the client component (no coordinates). */
type CityCard = Pick<
  DestinationCity,
  "slug" | "city" | "country" | "countryCode" | "iatas" | "airportCount"
> & {
  /** Faza 8A: photo thumb URL (Digi Storage mirror), null when the city has no photo */
  photoUrl: string | null;
};

export default async function DestinationsPage() {
  const counts = await getChosenCountsBySlug();
  const cities: CityCard[] = DESTINATION_CITIES.map(
    ({ slug, city, country, countryCode, iatas, airportCount }) => ({
      slug,
      city,
      country,
      countryCode,
      iatas,
      airportCount,
      photoUrl: CITY_IMAGES_BY_SLUG[slug]?.url ?? null,
    })
  );
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 md:max-w-3xl md:py-14">
      <DestinationsBrowser cities={cities} counts={counts} />
    </main>
  );
}
