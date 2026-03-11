"use client";

import { useState, useRef, useEffect } from "react";
import { usePWAInstall } from "@/lib/pwa/install-context";
import { useMobileBrowser } from "@/lib/use-mobile-browser";

/** True when running on iOS (iPhone/iPad). */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

/**
 * Top-of-page Install / Open app button.
 * Renders nothing when running in standalone (already in the app).
 * Shows "Install" when the app is installable, "Open app" when we've recorded an install.
 * On iOS where beforeinstallprompt never fires, shows "Add to Home Screen" with instructions.
 */
export default function InstallButton() {
  const pwa = usePWAInstall();
  const isMobile = useMobileBrowser();
  const [hintOpen, setHintOpen] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hintOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (hintRef.current && !hintRef.current.contains(e.target as Node)) setHintOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [hintOpen]);

  if (!pwa) return null;

  const { canInstall, isInstalled, isStandalone, runInstall, openApp } = pwa;

  if (isStandalone) return null;

  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={() => openApp()}
        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        aria-label="Open Healthia app"
      >
        Open app
      </button>
    );
  }

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={() => runInstall()}
        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        aria-label="Install Healthia app"
      >
        Install
      </button>
    );
  }

  // iOS: beforeinstallprompt never fires. Show Add to Home Screen with instructions.
  const ios = isIOS();
  if (isMobile && ios) {
    const instruction = "Tap the Share button, then 'Add to Home Screen'.";
    return (
      <div className="relative" ref={hintRef}>
        <button
          type="button"
          onClick={() => setHintOpen((v) => !v)}
          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          aria-label="Add to Home Screen"
          aria-expanded={hintOpen}
        >
          Add to Home Screen
        </button>
        {hintOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
            role="tooltip"
          >
            <p className="text-xs text-slate-700">{instruction}</p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
