import type { Metadata } from "next";

import { en } from "@/lib/i18n";
import LegalDocView from "@/components/LegalDocView";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: en.legal.privacy.title,
  description: en.legal.privacy.intro,
};

// Content is a client view so the language switcher re-renders it live; languages
// without a translated legal section fall back to English (EN + RO at minimum).
export default function PrivacyPage() {
  return (
    <>
      <LegalDocView docKey="privacy" />
      <Toaster />
    </>
  );
}
