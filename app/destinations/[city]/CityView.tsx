"use client";

// Client view of /destinations/[city]: hero (city, country, airports), pitch,
// "times chosen as a middle (last 90 days)" stat, 3-step how-it-works, FAQ and
// the CTA back to the search. All copy comes from the destinations.* i18n
// namespace via useMessages(), so the language switcher re-renders in place.
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon, PlaneIcon, PlaneTakeoffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CityImage } from "@/db/city-images";
import { useMessages } from "@/lib/i18n";

import type { DestinationCity } from "../cities";

type Props = {
  city: DestinationCity;
  /** distinct searches (last 90 days) with this city in the results */
  chosenCount: number;
  /** Faza 8A: free city photo (Wikimedia Commons → Digi Storage), null = no accepted photo */
  photo: CityImage | null;
};

export default function CityView({ city, chosenCount, photo }: Props) {
  const messages = useMessages();
  const t = messages.destinations.city;

  return (
    <div className="flex flex-col gap-10">
      {photo && (
        <figure className="flex flex-col gap-1.5">
          {/* plain <img> (not next/image): the photo is a remote mirror on Digi Storage,
              eager + 16/9 hero at the top of the page */}
          <img
            src={photo.url}
            alt={city.city}
            loading="eager"
            className="aspect-video w-full rounded-2xl border border-border object-cover shadow-sm"
          />
          <figcaption className="text-[11px] leading-snug text-muted-foreground">
            <a
              href={photo.source}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              {messages.destinations.photoCredit(photo.credit, photo.license)}
            </a>
          </figcaption>
        </figure>
      )}
      <Link
        href="/destinations"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t.back}
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t.pitch(city.city)}
        </h1>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <MapPinIcon className="h-4 w-4" />
          {city.city}, {city.country}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {t.pitchBody(city.city, city.country)}
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t.statsLabel}
        </h2>
        <p className="text-4xl font-bold text-foreground">
          {chosenCount > 0 ? `×${chosenCount}` : "—"}
        </p>
        {chosenCount === 0 && (
          <p className="text-sm text-muted-foreground">{t.statsEmpty}</p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <PlaneTakeoffIcon className="h-3.5 w-3.5 shrink-0" />
          {t.airportsLabel}: {city.iatas.join(", ")}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">{t.howTitle}</h2>
        <ol className="flex flex-col gap-4">
          {t.howSteps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-foreground">{t.faqTitle}</h2>
        <div className="flex flex-col gap-2">
          {t.faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                {faq.q.replaceAll("{city}", city.city)}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.a.replaceAll("{city}", city.city)}
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/">
            <PlaneIcon className="h-4 w-4" />
            {t.cta}
          </Link>
        </Button>
        <Link
          href="/destinations"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {t.back}
        </Link>
      </div>
    </div>
  );
}
