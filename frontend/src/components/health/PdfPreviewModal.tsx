"use client";

import { useCallback, useEffect } from "react";

type PdfPreviewModalProps = {
  url: string | null;
  onClose: () => void;
};

export default function PdfPreviewModal({ url, onClose }: PdfPreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!url) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [url, handleKeyDown]);

  if (!url) return null;

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
        aria-label="PDF preview"
        className="fixed inset-4 z-[61] flex flex-col rounded-xl border border-slate-200 bg-white shadow-xl sm:inset-8 lg:inset-16"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Document Preview</h2>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 p-2">
          <iframe
            src={url}
            title="PDF document preview"
            className="h-full w-full rounded-lg border border-slate-100"
          />
        </div>
      </div>
    </>
  );
}
