/**
 * Format helpers for display (dates, blood pressure, etc.).
 * Used by Dashboard, Profile, and other components.
 */

export type DateStyle = "short" | "long";

export function formatDate(s: string, style: DateStyle = "short"): string {
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { dateStyle: style });
  } catch {
    return s;
  }
}

/** Today's date as YYYY-MM-DD for date inputs */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
