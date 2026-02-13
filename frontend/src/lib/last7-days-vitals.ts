import type { Vital } from "@/types/vital";

function toDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

/** Last 7 calendar days ending on the latest vital date. One vital per day (latest entry that day), oldest to newest. */
export function getLast7DaysVitals(vitals: Vital[]): {
  vitalsByDay: (Vital | null)[];
  dateKeys: string[];
} {
  const empty = [null, null, null, null, null, null, null] as (Vital | null)[];
  const emptyLabels = ["—", "—", "—", "—", "—", "—", "—"];
  if (vitals.length === 0) return { vitalsByDay: empty, dateKeys: emptyLabels };

  const sorted = [...vitals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latestDate = new Date(sorted[0].date);
  const dayMs = 24 * 60 * 60 * 1000;
  const dateKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
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
