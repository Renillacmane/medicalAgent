"use client";

import { usePWAInstall } from "@/lib/pwa/install-context";

/**
 * Shown when the app is running as an installed PWA and the live manifest
 * version differs from the one we last saw. Asks the user to uninstall the
 * old app and reinstall from the website, with a short platform hint.
 */
export default function ManifestUpdateBanner() {
  const pwa = usePWAInstall();
  if (!pwa?.manifestUpdateAvailable || !pwa.isStandalone) return null;

  const { dismissManifestUpdate } = pwa;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-50 px-3 py-3 shadow-sm"
    >
      <div className="mx-auto max-w-lg">
        <p className="text-sm font-medium text-amber-900">
          A new version of Healthia is available. Please uninstall this app and
          reinstall from the website for the latest experience.
        </p>
        <details className="mt-2 text-xs text-amber-800">
          <summary className="cursor-pointer font-medium underline">
            How to uninstall
          </summary>
          <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
            <li>
              <strong>Chrome (desktop):</strong> Open{" "}
              <code className="rounded bg-amber-100 px-1">chrome://apps</code>,
              find Healthia → right‑click → Uninstall.
            </li>
            <li>
              <strong>Chrome (Android):</strong> Long‑press the Healthia icon →
              App info → Uninstall.
            </li>
            <li>
              <strong>iOS:</strong> Long‑press the Healthia icon → Remove App →
              Delete App.
            </li>
          </ul>
        </details>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={dismissManifestUpdate}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
