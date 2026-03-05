"use client";

import { useCallback, useEffect } from "react";
import type { Medication } from "@/types/health";
import { formatDate } from "@/lib/format";

export type CalendarSlot = {
  date: string;
  time: string;
  medications: Medication[];
};

type CalendarSlotDetailsModalProps = {
  slot: CalendarSlot | null;
  onClose: () => void;
};

function formatSlotLabel(date: string, time: string): string {
  try {
    const d = new Date(date + "T12:00:00");
    const datePart = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
    return `${datePart}, ${time}`;
  } catch {
    return `${date}, ${time}`;
  }
}

export default function CalendarSlotDetailsModal({ slot, onClose }: CalendarSlotDetailsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!slot) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [slot, handleKeyDown]);

  if (!slot) return null;

  const label = formatSlotLabel(slot.date, slot.time);

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Medication schedule details"
        className="fixed left-1/2 top-1/2 z-[61] w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-light-green-subtle/60 bg-white p-4 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-light-green-subtle/40 pb-3">
          <h2 className="text-sm font-semibold text-light-green-dark">{label}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-light-green-dark-grey hover:bg-light-green-subtle/40 hover:text-light-green-dark transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-3 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-3">
            {slot.medications.map((med) => (
              <li
                key={med.id}
                className="rounded-lg border border-light-green-subtle/40 bg-light-green-subtle/10 p-3 text-sm"
              >
                <p className="font-medium text-light-green-dark">{med.name}</p>
                <p className="mt-0.5 text-light-green-dark-grey">
                  {[med.dosage, med.frequency].filter(Boolean).join(" · ") || "—"}
                </p>
                {(med.startDate != null || (med.endDate != null && med.endDate !== "")) && (
                  <p className="mt-1 text-xs text-light-green-dark-grey">
                    {med.startDate ? formatDate(med.startDate, "short") : ""}
                    {med.startDate && med.endDate != null && med.endDate !== "" ? " – " : ""}
                    {med.endDate != null && med.endDate !== "" ? formatDate(med.endDate, "short") : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
