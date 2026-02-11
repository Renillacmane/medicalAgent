"use client";

import { usePWAInstall } from "@/lib/pwa/install-context";

/**
 * Top-of-page Install / Open app button.
 * Renders nothing when running in standalone (already in the app).
 * Shows "Install" when the app is installable, "Open app" when we've recorded an install.
 */
export default function InstallButton() {
  const pwa = usePWAInstall();
  if (!pwa) return null;

  const { canInstall, isInstalled, isStandalone, runInstall, openApp } = pwa;

  if (isStandalone) return null;

  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={openApp}
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

  return null;
}
