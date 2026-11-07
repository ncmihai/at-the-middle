"use client";

import { GlobeIcon } from "lucide-react";

import {
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  useLanguage,
  useMessages,
  type Language,
} from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Language switcher — sets the "midspot-lang" cookie and re-renders the page in
 * place (no routing change); document.documentElement.lang follows (PLAN.md Faza 3).
 */
export default function LangSwitcher({ className }: { className?: string }) {
  const [lang, setLang] = useLanguage();
  const messages = useMessages();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
      <SelectTrigger
        className={`h-8 w-auto gap-1.5 px-2 text-xs ${className ?? ""}`}
        aria-label={messages.lang.label}
      >
        <GlobeIcon className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((l) => (
          <SelectItem key={l} value={l}>
            {LANGUAGE_NAMES[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
