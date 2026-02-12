"use client";

import { useState } from "react";
import { openApp } from "@/lib/pwa/open-app";

const EMBED_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

type WidgetProps = {
  /** Base URL for the iframe when embedded on another origin (e.g. https://yourapp.com). Same-origin can leave empty. */
  embedBaseUrl?: string;
};

/** Health/heart icon for "Open app" when no app icon is set. */
function HealthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

/** External link / new tab icon. */
function NewTabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

/** Close icon. */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Widget({ embedBaseUrl = EMBED_BASE }: WidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const base = embedBaseUrl.replace(/\/$/, "") || "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const appBase = base || origin;
  const iframeSrc = `${appBase}/dashboard?widget=1`;
  
  // For "Open app" link, use relative path (consistent with manifest start_url)
  // appBase is only needed for iframe src when embedded on different origin
  const openAppHref = "/pwa/dashboard";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label="Healthia"
    >
      {expanded && (
        <div className="relative flex h-[min(560px,80vh)] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* Widget header: title + Open app, Open new tab, Close */}
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <h2 className="truncate text-base font-semibold text-slate-800">Healthia</h2>
            <div className="flex shrink-0 items-center gap-0.5">
              {/*
                "Open app" uses window.open() in the parent window to open the PWA.
                Since we're in an iframe, we need to open in the parent window (window.top).
                The URL "/pwa/dashboard" is within the PWA scope.
                Note: Link capturing requires user opt-in (chrome://apps → App info → "Open supported links").
              */}
              <button
                type="button"
                onClick={() => openApp(openAppHref)}
                className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Open app"
                title="Open app"
              >
                <HealthIcon className="h-5 w-5" />
              </button>
              {/*
                "Open in new tab" uses a real <a> tag with target="_blank".
                /dashboard is OUTSIDE the PWA scope ("/pwa"), so it opens in a regular browser tab.
                Relative path is sufficient - browser resolves it relative to current origin.
              */}
              <a
                href="/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <NewTabIcon className="h-5 w-5" />
              </a>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
                title="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1">
            <iframe
              src={iframeSrc}
              title="Healthia"
              className="h-full w-full border-0"
            />
          </div>
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
