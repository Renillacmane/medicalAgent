"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { suggestReminderTimes } from "@/lib/medication-schedule";
import { batchCreateMedications } from "@/services/patients.service";
import type { BatchMedicationItem } from "@/types/health";

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

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
  sourceDocumentId?: string;
  onSaveSuccess?: () => void;
};

function validateReminderTimes(times: string[]): boolean {
  if (times.length === 0) return true;
  return times.every((t) => HHMM_REGEX.test(t.trim()));
}

function validateItems(items: MedicationFormItem[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const item of items) {
    const itemErrors: string[] = [];
    if (!item.name?.trim()) itemErrors.push("Name is required.");
    if (!item.startDate) itemErrors.push("Start date is required.");
    const times = item.reminderTimes ?? [];
    if (!validateReminderTimes(times)) itemErrors.push("Reminder times must be in HH:mm format.");
    if (itemErrors.length > 0) errors[item.id] = itemErrors;
  }
  return errors;
}

export default function MedicationReviewDialog({
  isOpen,
  onClose,
  documentName,
  initialMedications,
  sourceDocumentId,
  onSaveSuccess,
}: MedicationReviewDialogProps) {
  const [items, setItems] = useState<MedicationFormItem[]>(initialMedications);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setValidationErrors({});

    if (items.length === 0) {
      setSaveError("Add at least one medication to save.");
      return;
    }

    const errors = validateItems(items);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const medications: BatchMedicationItem[] = items.map((item) => ({
        name: item.name.trim(),
        dosage: item.dosage?.trim() || undefined,
        frequency: item.frequency?.trim() || undefined,
        timesPerDay: item.timesPerDay ?? 1,
        reminderTimes: (item.reminderTimes ?? []).length > 0 ? item.reminderTimes : undefined,
        startDate: item.startDate,
        endDate: item.endDate ?? undefined,
      }));
      await batchCreateMedications({
        sourceDocumentId: sourceDocumentId || undefined,
        medications,
      });
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save medications.");
    } finally {
      setSaving(false);
    }
  }, [items, sourceDocumentId, onSaveSuccess, onClose]);

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
                    className={`rounded-xl border p-4 shadow-sm ${
                      validationErrors[item.id]
                        ? "border-amber-300 bg-amber-50/60"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    {validationErrors[item.id] && (
                      <ul className="mb-2 list-inside list-disc text-xs text-amber-800">
                        {validationErrors[item.id].map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    )}
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

        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 px-5 py-3">
          {saveError && (
            <p className="text-sm text-red-600" role="alert">
              {saveError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              You can fine-tune these medications before saving them.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !hasMedications}
                onClick={handleSave}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

