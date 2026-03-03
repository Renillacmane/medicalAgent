"use client";

import { useCallback, useEffect, useState } from "react";
import { suggestReminderTimes } from "@/lib/medication-schedule";
import { updateMedication } from "@/services/patients.service";
import type { Medication } from "@/types/health";

const HH_MM_REGEX = /^\d{2}:\d{2}$/;

function parseReminderTimes(times: string): string[] {
  return times
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function validateReminderTimes(times: string[]): boolean {
  return times.length > 0 && times.every((t) => HH_MM_REGEX.test(t));
}

type MedicationEditModalProps = {
  medication: Medication | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function MedicationEditModal({
  medication,
  onClose,
  onSaved,
}: MedicationEditModalProps) {
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [reminderTimesDisplay, setReminderTimesDisplay] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!medication) return;
    setTimesPerDay(medication.timesPerDay ?? 1);
    setReminderTimesDisplay((medication.reminderTimes ?? []).join(", "));
    setStartDate(medication.startDate ?? "");
    setEndDate(medication.endDate ?? null);
    setIsActive(medication.isActive);
    setError(null);
  }, [medication]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!medication) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [medication, onClose],
  );

  useEffect(() => {
    if (!medication) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [medication, handleKeyDown]);

  const handleTimesPerDayChange = useCallback((value: number) => {
    const safe = Math.max(1, Math.min(value, 4));
    setTimesPerDay(safe);
    setReminderTimesDisplay(suggestReminderTimes(safe).join(", "));
  }, []);

  const handleSave = useCallback(async () => {
    if (!medication) return;
    const times = parseReminderTimes(reminderTimesDisplay);
    if (!validateReminderTimes(times)) {
      setError("Reminder times must be in HH:mm format (e.g. 08:00, 20:00).");
      return;
    }
    if (!startDate.trim()) {
      setError("Start date is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateMedication(medication.id, {
        timesPerDay,
        reminderTimes: times,
        startDate: startDate || undefined,
        endDate: endDate === "" ? undefined : endDate ?? undefined,
        isActive,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update medication");
    } finally {
      setSaving(false);
    }
  }, [medication, timesPerDay, reminderTimesDisplay, startDate, endDate, isActive, onSaved, onClose]);

  if (!medication) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="medication-edit-title"
        className="fixed left-1/2 top-1/2 z-[61] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="medication-edit-title" className="text-base font-semibold text-slate-900">
            Edit reminder settings
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {medication.name}
            {medication.dosage ? ` — ${medication.dosage}` : ""}
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Times per day
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={timesPerDay}
              onChange={(e) => handleTimesPerDayChange(Number.parseInt(e.target.value || "1", 10) || 1)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
              Reminder times (HH:mm, comma separated)
            </label>
            <input
              type="text"
              value={reminderTimesDisplay}
              onChange={(e) => setReminderTimesDisplay(e.target.value)}
              placeholder="08:00, 20:00"
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                End date
              </label>
              <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => setEndDate(e.target.value === "" ? null : e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="medication-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-light-green-primary focus:ring-light-green-primary/40"
            />
            <label htmlFor="medication-active" className="text-sm font-medium text-slate-700">
              Medication is active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}
