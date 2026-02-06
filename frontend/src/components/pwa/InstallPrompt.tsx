"use client";

import { usePWAInstall } from "@/lib/pwa/install-context";

/**
 * Custom "Add to Home Screen" floating banner.
 * Uses shared PWA context: shows when installable and not dismissed.
 * On accept, install is recorded (and optional context) in the context provider.
 */
export default function InstallPrompt() {
  const pwa = usePWAInstall();
  if (!pwa) return null;

  const {
    canInstall,
    bannerDismissed,
    runInstall,
    dismissBanner,
    isInstalled,
  } = pwa;

  const visible = canInstall && !bannerDismissed && !isInstalled;
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-[slideUp_0.3s_ease-out] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-slate-800">
        Add Healthia to your home screen
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Quick access, works offline, feels like a native app.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => runInstall()}
          className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
