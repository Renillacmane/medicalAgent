/**
 * Service Worker registration helper.
 * Called once from ServiceWorkerRegistrar (client component in root layout).
 *
 * Skipped in the native Capacitor app so API requests go through the document
 * (and respect the WebView's mixed content setting for HTTP backends). In native,
 * offline still works without the SW:
 *   - API GET (vitals, profile, recommendations): cached in IndexedDB and served
 *     on network failure by authGet() in api.ts.
 *   - Pending vitals: queued in IndexedDB; synced when back online via the
 *     window "online" listener and AddVitalsForm mount (sync-manager, use-online-status).
 *   - App shell: Capacitor serves the app from the device, so routes work offline.
 */

import { isNativeCapacitor } from "@/lib/capacitor";

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  if (isNativeCapacitor()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Listen for a new service worker waiting to activate
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New version available – for now just log.
          // A future enhancement could show a toast prompting the user to refresh.
          console.log("[PWA] New version available. Refresh to update.");
        }
      });
    });

    console.log("[PWA] Service worker registered:", registration.scope);
    return registration;
  } catch (err) {
    console.warn("[PWA] Service worker registration failed:", err);
    return null;
  }
}
