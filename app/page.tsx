import type { Metadata } from "next";
import { PlaneIcon } from "lucide-react";

import { messages } from "@/lib/messages";
import AdsSlot from "@/components/AdsSlot";
import SearchForm from "@/components/SearchForm";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: `${messages.brand.heroTitle} — ${messages.brand.name}`,
  description: messages.brand.heroSubtitle,
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10 md:max-w-2xl md:py-16">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <PlaneIcon className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {messages.brand.heroTitle}
          </h1>
          <p className="max-w-md text-balance text-muted-foreground">
            {messages.brand.heroSubtitle}
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {messages.brand.heroPoints.map((point) => (
              <li
                key={point}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm"
              >
                {point}
              </li>
            ))}
          </ul>
        </header>

        <SearchForm />

        {/* one ad slot below the form — never above the fold (app-spec §9) */}
        <AdsSlot position="home" />
      </div>
      <Toaster />
    </main>
  );
}
