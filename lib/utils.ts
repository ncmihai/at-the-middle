import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "1 h 35 min" / "45 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** gapMinutes -> "arrive within 1 h 35 min" style duration text */
export function formatGap(minutes: number): string {
  return formatDuration(minutes);
}

/** EUR money, e.g. €198.50 */
export function formatMoney(eur: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(eur);
}

/** ISO with offset ("2026-09-03T06:40:00+03:00") -> "Sep 3, 06:40" */
export function formatLocalDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, HH:mm");
  } catch {
    return iso;
  }
}

/** ISO with offset -> time only "06:40" */
export function formatLocalTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return iso;
  }
}

/** "2026-09-03" -> "Sep 3, 2026" */
export function formatDateShort(iso: string): string {
  try {
    return format(parseISO(iso + "T00:00:00"), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

/** "2026-09-03" -> "Sep 3" */
export function formatDateDay(iso: string): string {
  try {
    return format(parseISO(iso + "T00:00:00"), "MMM d");
  } catch {
    return iso;
  }
}
