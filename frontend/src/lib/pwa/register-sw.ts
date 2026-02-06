/**
 * Service Worker registration helper.
 * Called once from ServiceWorkerRegistrar (client component in root layout).
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
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
