// app/blog/postDate.ts — client-safe post-date formatter.
// "2026-11-08" is parsed into a LOCAL Date (not UTC midnight) so the formatted
// date can never shift a day back in negative-offset timezones.
export function formatPostDate(iso: string, lang: string): string {
  const parts = iso.split("-").map(Number);
  const date = new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1);
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(date);
  } catch {
    return iso;
  }
}
