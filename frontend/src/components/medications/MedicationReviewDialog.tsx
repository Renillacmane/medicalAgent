"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { suggestReminderTimes } from "@/lib/medication-schedule";

type MedicationFormItem = {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  timesPerDay?: number;
  reminderTimes?: string[];
  startDate?: string;
  endDate?: string | null;
};

type MedicationReviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  initialMedications: MedicationFormItem[];
};

export default function MedicationReviewDialog({
  isOpen,
  onClose,
  documentName,
  initialMedications,
}: MedicationReviewDialogProps) {
  const [items, setItems] = useState<MedicationFormItem[]>(initialMedications);

  const handleAddMedication = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);

    setItems((current) => [
      ...current,
      {
        id: `new-${crypto.randomUUID()}`,
        name: "",
        dosage: "",
        frequency: "once daily",
        timesPerDay: 1,
        reminderTimes: suggestReminderTimes(1),
        startDate: today,
        endDate: null,
      },
    ]);
  }, []);

  useEffect(() => {
    setItems(initialMedications);
  }, [initialMedications]);

  const hasMedications = useMemo(() => items.length > 0, [items.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

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
        aria-labelledby="medication-review-title"
        className="fixed left-1/2 top-1/2 z-[61] flex max-h-[calc(100vh-2rem)] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              id="medication-review-title"
              className="text-base font-semibold text-slate-900"
            >
              Review Medications
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              {documentName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddMedication}
            className="ml-4 inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-light-green-primary/40"
          >
            <span className="mr-1 text-base leading-none">+</span>
            Add
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!hasMedications && (
            <p className="text-sm text-slate-600">
              No medications were detected in this prescription.
            </p>
          )}

          {hasMedications && (
            <div className="space-y-4">
              {items.map((item) => {
                const timesPerDay = item.timesPerDay ?? 1;
                const reminderTimesDisplay = (item.reminderTimes ?? []).join(", ");

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id ? { ...m, name: event.target.value } : m,
                              ),
                            )
                          }
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={item.dosage ?? ""}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id ? { ...m, dosage: event.target.value } : m,
                              ),
                            )
                          }
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={item.frequency ?? ""}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id
                                  ? { ...m, frequency: event.target.value }
                                  : m,
                              ),
                            )
                          }
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Times per day
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={4}
                          value={timesPerDay}
                          onChange={(event) => {
                            const nextTimesPerDay = Number.parseInt(event.target.value || "1", 10);
                            const safeTimesPerDay = Number.isNaN(nextTimesPerDay)
                              ? 1
                              : Math.max(1, Math.min(nextTimesPerDay, 4));
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id
                                  ? {
                                      ...m,
                                      timesPerDay: safeTimesPerDay,
                                      reminderTimes: suggestReminderTimes(safeTimesPerDay),
                                    }
                                  : m,
                              ),
                            );
                          }}
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Reminder times (HH:mm, comma separated)
                        </label>
                        <input
                          type="text"
                          value={reminderTimesDisplay}
                          onChange={(event) => {
                            const raw = event.target.value;
                            const parts = raw
                              .split(",")
                              .map((part) => part.trim())
                              .filter((part) => part.length > 0);
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id ? { ...m, reminderTimes: parts } : m,
                              ),
                            );
                          }}
                          placeholder="08:00, 20:00"
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          Start date
                        </label>
                        <input
                          type="date"
                          value={item.startDate ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id ? { ...m, startDate: value || undefined } : m,
                              ),
                            );
                          }}
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                          End date
                        </label>
                        <input
                          type="date"
                          value={item.endDate ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setItems((current) =>
                              current.map((m) =>
                                m.id === item.id
                                  ? { ...m, endDate: value === "" ? null : value }
                                  : m,
                              ),
                            );
                          }}
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">
            You can fine-tune these medications before saving them.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

