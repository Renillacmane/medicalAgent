import { todayISO } from "@/lib/format";

const STORAGE_KEY_PREFIX = "vitals-catchup-bubble-dismissed";

/** SessionStorage key for "vitals catch-up bubble dismissed" for a given date (YYYY-MM-DD). */
export function vitalsCatchUpDismissedKey(dateStr?: string): string {
  return `${STORAGE_KEY_PREFIX}-${dateStr ?? todayISO()}`;
}

/** Mark the vitals catch-up bubble as dismissed/acted upon for today so it does not show again. */
export function markVitalsCatchUpDismissedForToday(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(vitalsCatchUpDismissedKey(), "true");
  } catch {
    // Ignore storage errors
  }
}

/** True if the bubble was already dismissed or acted upon for the given date. */
export function isVitalsCatchUpDismissedForDate(dateStr: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(vitalsCatchUpDismissedKey(dateStr)) === "true";
  } catch {
    return true;
  }
}
