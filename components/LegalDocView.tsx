"use client";

import Link from "next/link";
import { ArrowLeftIcon, PlaneIcon } from "lucide-react";

import { en, useMessages, type LegalDoc } from "@/lib/i18n";

/**
 * Renders one legal document (privacy/terms) from the messages module.
 * Languages without a translated `legal` section fall back to English
 * (PLAN.md: legal pages "EN + RO at minimum").
 */
export default function LegalDocView({ docKey }: { docKey: "privacy" | "terms" }) {
  const messages = useMessages();
  const doc: LegalDoc = messages.legal?.[docKey] ?? en.legal[docKey];

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 md:py-14">
        <header>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PlaneIcon className="h-4 w-4" />
            </span>
            {messages.brand.name}
          </Link>
        </header>
        <article className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{doc.title}</h1>
            <p className="text-xs text-muted-foreground">{doc.updated}</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{doc.intro}</p>
          {doc.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-2">
              <h2 className="text-base font-semibold">{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {messages.notFound.backHome}
          </Link>
        </article>
      </div>
    </main>
  );
}
