"use client";

import { useState } from "react";

const EMBED_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

type WidgetProps = {
  /** Base URL for the iframe when embedded on another origin (e.g. https://yourapp.com). Same-origin can leave empty. */
  embedBaseUrl?: string;
};

export default function Widget({ embedBaseUrl = EMBED_BASE }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const base = embedBaseUrl.replace(/\/$/, "") || "";
  const iframeSrc = base ? `${base}/dashboard` : "/dashboard";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label="Healthia"
    >
      {expanded && (
        <div className="relative flex h-[min(560px,80vh)] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute right-2 top-2 z-10 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <iframe
            src={iframeSrc}
            title="Healthia"
            className="h-full w-full border-0"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        aria-label={expanded ? "Close" : "Open Healthia"}
      >
        {expanded ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <span className="text-sm font-medium">Hi</span>
        )}
      </button>
    </div>
  );
}
