"use client";

import { useState, useMemo } from "react";

/** One reminder slot on a given date (time + optional payload for details view) */
export interface CalendarEvent {
  date: string;
  time: string;
  medications?: unknown[];
}

export interface MedicationCalendarProps {
  /** Events to show as dots (date YYYY-MM-DD, time e.g. "08:00") */
  events: CalendarEvent[];
  /** Called when user clicks a dot; slot has date, time, and medications for that slot */
  onSlotClick?: (slot: { date: string; time: string; medications: unknown[] }) => void;
  /** Optional class for the root container */
  className?: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

/** Build grid rows: first row may have leading empty cells so day 1 aligns to correct weekday */
function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const days = getDaysInMonth(year, month);
  const firstDay = days[0].getDay();
  const leadingBlanks = firstDay;
  const flat: (Date | null)[] = [...Array(leadingBlanks).fill(null), ...days];
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    rows.push(flat.slice(i, i + 7));
  }
  const lastRow = rows[rows.length - 1];
  if (lastRow) {
    while (lastRow.length < 7) lastRow.push(null);
  }
  return rows;
}

/** Group events by date then by time; return map date -> list of { time, medications } */
function groupEventsByDateAndTime(events: CalendarEvent[]): Map<string, { time: string; medications: unknown[] }[]> {
  const byDate = new Map<string, Map<string, unknown[]>>();
  for (const e of events) {
    const key = e.date;
    if (!byDate.has(key)) byDate.set(key, new Map());
    const byTime = byDate.get(key)!;
    const meds = e.medications ?? [];
    if (!byTime.has(e.time)) byTime.set(e.time, []);
    const existing = byTime.get(e.time)! as unknown[];
    for (const m of meds) existing.push(m);
    byTime.set(e.time, existing);
  }
  const result = new Map<string, { time: string; medications: unknown[] }[]>();
  byDate.forEach((byTime, date) => {
    const slots = Array.from(byTime.entries()).map(([time, medications]) => ({ time, medications }));
    result.set(date, slots);
  });
  return result;
}

export default function MedicationCalendar({ events, onSlotClick, className = "" }: MedicationCalendarProps) {
  const today = useMemo(() => toYYYYMMDD(new Date()), []);
  const [viewDate, setViewDate] = useState(() => new Date());

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const eventsByDate = useMemo(() => groupEventsByDateAndTime(events), [events]);

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  const goToday = () => setViewDate(new Date());

  const isCurrentMonth = viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth();

  return (
    <div className={`rounded-xl border border-light-green-subtle/60 bg-white shadow-card overflow-hidden ${className}`.trim()}>
      <div className="flex items-center justify-between border-b border-light-green-subtle/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-light-green-dark">Medication schedule</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded p-1.5 text-light-green-dark-grey hover:bg-light-green-subtle/40 hover:text-light-green-dark transition-colors"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-light-green-dark" aria-live="polite">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded p-1.5 text-light-green-dark-grey hover:bg-light-green-subtle/40 hover:text-light-green-dark transition-colors"
            aria-label="Next month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToday}
              className="ml-1 rounded-md bg-light-green-subtle/50 px-2 py-1 text-xs font-medium text-light-green-dark hover:bg-light-green-subtle transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-1 text-xs font-medium text-light-green-dark-grey"
              aria-hidden
            >
              {label}
            </div>
          ))}
          {grid.flat().map((cell, i) => {
            if (cell === null) {
              return <div key={`empty-${i}`} className="aspect-square min-h-[32px]" />;
            }
            const dateKey = toYYYYMMDD(cell);
            const slots = eventsByDate.get(dateKey) ?? [];
            const isToday = dateKey === today;

            return (
              <div
                key={dateKey}
                className={`relative flex min-h-[40px] flex-col items-center justify-start rounded-md p-1 ${
                  isToday ? "ring-2 ring-light-green-primary bg-light-green-subtle/30" : "bg-light-green-subtle/10"
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? "text-light-green-dark" : "text-light-green-dark-grey"}`}>
                  {cell.getDate()}
                </span>
                {slots.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                    {slots.slice(0, 5).map((slot, j) => (
                      <button
                        key={`${slot.time}-${j}`}
                        type="button"
                        onClick={() => onSlotClick?.({ date: dateKey, time: slot.time, medications: slot.medications })}
                        className="h-1.5 w-1.5 rounded-full bg-light-green-primary hover:bg-light-green-dark focus:outline-none focus:ring-2 focus:ring-light-green-primary focus:ring-offset-1"
                        aria-label={`Reminders at ${slot.time} on ${dateKey}`}
                        title={`${dateKey} ${slot.time}`}
                      />
                    ))}
                    {slots.length > 5 && (
                      <span className="text-[10px] text-light-green-dark-grey" aria-hidden>
                        +{slots.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
