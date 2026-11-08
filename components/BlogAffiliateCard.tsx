// BlogAffiliateCard — server component rendered at the end of /blog/[slug] when
// the post's frontmatter has `city: <destinations-slug>` (see lib/blog.ts).
//
// Shows the destination (name, country, photo from the shared city-photo lookup)
// and 3 partner links built SERVER-side with the existing lib/affiliate helpers:
//   · flights to the city  — Kiwi deep link wrapped in the Travelpayouts c111
//     click template (wrapAffiliateDeepLink — Kiwi is on the Links API exclusion
//     list, so it always goes through the manual template, same as every flight
//     booking link on the site). Generic dates: the Friday ~4 weeks out → Monday.
//   · activities (Tiqets) and airport transfer (Welcome Pickups) — brand URLs
//     converted through the Travelpayouts Links API in ONE batched call
//     (convertViaLinksApi, cached 1 h in-process), falling back to the plain
//     brand URL when the API is not configured/unreachable — the card always
//     shows all three links, and the footer discloses the affiliate relationship.
//
// The /blog/[slug] page is ISR (revalidate = 3600), so the links are recomputed
// at most once an hour per post. Never throws: an unknown slug renders nothing.
import Link from "next/link";
import { addDays, format, nextFriday } from "date-fns";
import { ArrowRightIcon, CarTaxiFrontIcon, MapPinIcon, PlaneIcon, TicketIcon, type LucideIcon } from "lucide-react";

import { DESTINATIONS_BY_SLUG } from "@/app/destinations/cities";
import { convertViaLinksApi, tiqetsUrl, welcomePickupsUrl } from "@/lib/affiliate";
import { cityPhotoForSlug } from "@/lib/city-photo";
import { wrapAffiliateDeepLink } from "@/lib/flights/provider";
import { en } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

/** Generic trip window for the flight link: Friday ~4 weeks out, back Monday. */
function genericTripDates(): { departure: string; back: string } {
  const dep = addDays(nextFriday(new Date()), 28);
  return { departure: format(dep, "yyyy-MM-dd"), back: format(addDays(dep, 3), "yyyy-MM-dd") };
}

export default async function BlogAffiliateCard({ city }: { city: string }) {
  const dest = DESTINATIONS_BY_SLUG[city.trim().toLowerCase()];
  if (!dest) return null;
  const photo = cityPhotoForSlug(dest.slug);

  // --- affiliate links, built server-side -----------------------------------
  const { departure, back } = genericTripDates();
  const iata = dest.iatas[0] ?? "";
  // Kiwi /deep with destination only = "flights to <city> from anywhere";
  // c111 click template (Kiwi is excluded from the Links API — see lib/affiliate.ts).
  const flightsUrl = wrapAffiliateDeepLink(
    `https://www.kiwi.com/deep?to=${encodeURIComponent(iata)}&departure=${departure}&return=${back}`
  );
  const activitiesBrand = tiqetsUrl(dest.city);
  const transferBrand = welcomePickupsUrl(dest.city);
  // One batched Links API call for the two extras brands (Tiqets + Welcome
  // Pickups are connected to our Travelpayouts project); null on any failure →
  // fall back to the plain brand URL so the card always has all three links.
  const [activitiesUrl, transferUrl] = await convertViaLinksApi(
    [activitiesBrand, transferBrand],
    "midspot-blog-card"
  );

  const links: { key: string; label: string; url: string; Icon: LucideIcon }[] = [
    { key: "flights", label: `Flights to ${dest.city}`, url: flightsUrl, Icon: PlaneIcon },
    { key: "transfer", label: en.results.extras.transfer, url: transferUrl ?? transferBrand, Icon: CarTaxiFrontIcon },
    { key: "activities", label: en.results.extras.activities, url: activitiesUrl ?? activitiesBrand, Icon: TicketIcon },
  ];

  return (
    <Card className="mt-10 overflow-hidden">
      {/* photo header (plain <img> — the photo is a remote Digi Storage mirror,
          same pattern as the /destinations hero) */}
      {photo ? (
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          <img src={photo.url} alt={dest.city} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="photo-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              Plan the trip · partner links
            </p>
            <h2 className="mt-1 flex items-center gap-1.5 text-2xl font-bold tracking-tight text-white drop-shadow-md md:text-3xl">
              <MapPinIcon className="h-5 w-5 shrink-0" />
              {dest.city}, {dest.country}
            </h2>
          </div>
        </div>
      ) : (
        <CardHeader>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Plan the trip · partner links
          </p>
          <h2 className="flex items-center gap-1.5 text-2xl font-bold tracking-tight text-foreground">
            <MapPinIcon className="h-5 w-5 shrink-0 text-primary" />
            {dest.city}, {dest.country}
          </h2>
        </CardHeader>
      )}

      <CardContent className={cn("flex flex-col gap-3", !photo && "pt-2")}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Heading to {dest.city}? These partner links take you straight to flights, an airport
          transfer and the top activities — booked on the partner&apos;s site, at the same price
          for you.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {links.map(({ key, label, url, Icon }) => (
            <Button key={key} asChild size="sm" variant="outline">
              <a href={url} target="_blank" rel="noopener sponsored">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </a>
            </Button>
          ))}
        </div>
        <Link
          href={`/destinations/${dest.slug}`}
          className="group flex w-fit items-center gap-1 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
        >
          See {dest.city} as a meeting point
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>

      <CardFooter>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {en.results.stayNote} — partner links: the price for you is exactly the same; the commission
          is paid to us by the partner, never by you.
        </p>
      </CardFooter>
    </Card>
  );
}
