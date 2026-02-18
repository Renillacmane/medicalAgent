import type { Vital } from "@/types/vital";

function toDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

/** Allowed vitals period lengths (days). Single source of truth for charts and API. */
export const VITALS_PERIOD_OPTIONS = [7, 15, 30] as const;
export type VitalsPeriodDays = (typeof VITALS_PERIOD_OPTIONS)[number];

/** Last N calendar days ending on the latest vital date. One vital per day (latest entry that day), oldest to newest. */
export function getDailyVitals(
  vitals: Vital[],
  periodDays: number,
): { vitalsByDay: (Vital | null)[]; dateKeys: string[] } {
  const n = Math.max(1, Math.min(periodDays, 90));
  const empty = Array.from({ length: n }, () => null) as (Vital | null)[];
  const emptyLabels = Array.from({ length: n }, () => "—");
  if (vitals.length === 0) return { vitalsByDay: empty, dateKeys: emptyLabels };

  const sorted = [...vitals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latestDate = new Date(sorted[0].date);
  const dayMs = 24 * 60 * 60 * 1000;
  const dateKeys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(latestDate.getTime() - i * dayMs);
    dateKeys.push(toDateKey(d.toISOString()));
  }

  const byDay = new Map<string, Vital[]>();
  for (const v of vitals) {
    const key = toDateKey(v.date);
    if (!dateKeys.includes(key)) continue;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(v);
  }

  const vitalsByDay: (Vital | null)[] = dateKeys.map((key) => {
    const list = byDay.get(key);
    if (!list?.length) return null;
    const byCreated = [...list].sort(
      (a, b) =>
        new Date(b.createdAt ?? b.date).getTime() - new Date(a.createdAt ?? a.date).getTime(),
    );
    return byCreated[0];
  });

  return { vitalsByDay, dateKeys };
}
