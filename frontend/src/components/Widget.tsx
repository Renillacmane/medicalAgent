"use client";

import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";

export default function Widget() {
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"login" | "dashboard">("login");

  // After login, show dashboard; when opening widget, show dashboard if already logged in
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    setView(token ? "dashboard" : "login");
  }, [expanded]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      aria-label="Medical Agent widget"
    >
      {expanded && (
        <div className="w-[360px] max-w-[calc(100vw-3rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Medical Agent</h2>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close widget"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {view === "dashboard" ? (
            <p className="text-slate-800">Welcome back</p>
          ) : (
            <LoginForm onSuccess={() => setView("dashboard")} />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        aria-label={expanded ? "Close widget" : "Open widget"}
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
