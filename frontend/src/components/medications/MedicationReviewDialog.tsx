"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MedicationFormItem = {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
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
        className="fixed left-1/2 top-1/2 z-[61] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
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

        <div className="max-h-[min(460px,calc(100vh-11rem))] overflow-y-auto px-5 py-4">
          {!hasMedications && (
            <p className="text-sm text-slate-600">
              No medications were detected in this prescription.
            </p>
          )}

          {hasMedications && (
            <div className="space-y-4">
              {items.map((item) => (
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
                              m.id === item.id ? { ...m, frequency: event.target.value } : m,
                            ),
                          )
                        }
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
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

