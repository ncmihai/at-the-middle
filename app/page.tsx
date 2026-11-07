import type { Metadata } from "next";

import { en } from "@/lib/i18n";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: `${en.brand.heroTitle} — ${en.brand.name}`,
  description: en.brand.heroSubtitle,
};

// The page itself is a client view (components/HomePage) so the language switcher
// re-renders all copy live via useMessages(); metadata stays here, server-side.
export default function Home() {
  return <HomePage />;
}
