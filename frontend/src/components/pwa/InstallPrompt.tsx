"use client";

import { usePWAInstall } from "@/lib/pwa/install-context";
import { useMobileBrowser } from "@/lib/use-mobile-browser";
import NotificationBubble from "@/components/notifications/NotificationBubble";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

/**
 * Custom "Add to Home Screen" floating banner.
 * Uses shared PWA context: shows when installable and not dismissed.
 * On iOS, also shows when the browser does not fire beforeinstallprompt, with instructions.
 */
export default function InstallPrompt() {
  const pwa = usePWAInstall();
  const isMobile = useMobileBrowser();
  if (!pwa) return null;

  const { canInstall, bannerDismissed, runInstall, dismissBanner, isInstalled, isStandalone } = pwa;

  const showForMobile = isMobile && isIOS() && !isStandalone && !canInstall && !isInstalled;
  const visible = (canInstall || showForMobile) && !bannerDismissed && !isInstalled;
  if (!visible) return null;

  const instruction = "Tap the Share button, then 'Add to Home Screen'.";

  return (
    <NotificationBubble className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-[slideUp_0.3s_ease-out]">
      <p className="text-sm font-medium text-slate-800">
        Add Healthia to your home screen
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {canInstall
          ? "Quick access, works offline, feels like a native app."
          : instruction}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {canInstall && (
          <button
            type="button"
            onClick={() => runInstall()}
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          {canInstall ? "Not now" : "Got it"}
        </button>
      </div>
    </NotificationBubble>
  );
}
