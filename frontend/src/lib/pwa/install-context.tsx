"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { openApp as openAppPwa } from "@/lib/pwa/open-app";

/** Fired by the browser when the app is installable; we keep it to call .prompt() later. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PWAInstallContextValue = {
  /** Browser said we can show the install prompt (beforeinstallprompt fired). */
  canInstall: boolean;
  /** We recorded that the user accepted install (stored in localStorage). */
  isInstalled: boolean;
  /** App is running in standalone window (installed PWA), not in a browser tab. */
  isStandalone: boolean;
  /** Call this to show the native install UI; call onAccepted when user accepts. */
  runInstall: (onAccepted?: () => void) => Promise<void>;
  /** Mark the floating banner as dismissed (persisted). */
  dismissBanner: () => void;
  /** Whether the user dismissed the banner (don’t show it again). */
  bannerDismissed: boolean;
  /** Navigate to app start URL (for "Open app" when already installed). */
  openApp: () => void;
  /** Stored install context (when/where), if any. */
  installContext: { installedAt: string; platform: string } | null;
  /** True when running in standalone and the live manifest version differs from the one we last saw (user should reinstall). */
  manifestUpdateAvailable: boolean;
  /** Call after the user acknowledges the manifest-update banner (stores current version so we don’t show again). */
  dismissManifestUpdate: () => void;
};

const DISMISSED_KEY = "healthia-install-dismissed";
const INSTALLED_KEY = "healthia-pwa-installed";
const INSTALL_CONTEXT_KEY = "healthia-pwa-install-context";
const MANIFEST_VERSION_KEY = "healthia-pwa-manifest-version";

function getPlatform(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(ua)) return "macos";
  if (/Win/i.test(ua)) return "windows";
  if (/Linux/i.test(ua)) return "linux";
  return "other";
}

function readInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(INSTALLED_KEY) === "1";
}

function readInstallContext(): PWAInstallContextValue["installContext"] {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(INSTALL_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { installedAt: string; platform: string };
    return parsed.installedAt && parsed.platform ? parsed : null;
  } catch {
    return null;
  }
}

function readBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISMISSED_KEY) === "1";
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [installContext, setInstallContext] = useState<
    PWAInstallContextValue["installContext"]
  >(null);
  // TODO - set message to show in the banner
  const [manifestUpdateAvailable, setManifestUpdateAvailable] = useState(false);

  useEffect(() => {
    const installed = readInstalled();
    const context = readInstallContext();
    const dismissed = readBannerDismissed();
    setIsInstalled(installed);
    setInstallContext(context);
    setBannerDismissed(dismissed);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const mqMinimal = window.matchMedia("(display-mode: minimal-ui)");
    const mqFullscreen = window.matchMedia("(display-mode: fullscreen)");
    const check = () => {
      setIsStandalone(mq.matches || mqMinimal.matches || mqFullscreen.matches);
    };
    check();
    mq.addEventListener("change", check);
    mqMinimal.addEventListener("change", check);
    mqFullscreen.addEventListener("change", check);
    return () => {
      mq.removeEventListener("change", check);
      mqMinimal.removeEventListener("change", check);
      mqFullscreen.removeEventListener("change", check);
    };
  }, []);

  // When we're running in standalone, the user has the app installed (via our prompt or system UI).
  // Persist that so when they open the site in a browser tab we can show "Open app" instead of "Install".
  useEffect(() => {
    if (isStandalone) {
      const wasStored = localStorage.getItem(INSTALLED_KEY) === "1";
      if (!wasStored) {
        const context = {
          installedAt: new Date().toISOString(),
          platform: getPlatform(),
        };
        localStorage.setItem(INSTALLED_KEY, "1");
        localStorage.setItem(INSTALL_CONTEXT_KEY, JSON.stringify(context));
        setInstallContext(context);
      }
      setIsInstalled(true);
    }
  }, [isStandalone]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // If beforeinstallprompt fires and we're not in standalone, the app is NOT installed.
      // Clear stale localStorage flag so we show "Install" instead of "Open app".
      if (!isStandalone && localStorage.getItem(INSTALLED_KEY) === "1") {
        localStorage.removeItem(INSTALLED_KEY);
        localStorage.removeItem(INSTALL_CONTEXT_KEY);
        setIsInstalled(false);
        setInstallContext(null);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  // When running in standalone (installed PWA), fetch live manifest and compare version to stored.
  // Run only when isStandalone is true. Use cache-busting so we get the server manifest, not a cached one.
  useEffect(() => {
    if (typeof window === "undefined" || !isStandalone) return;

    let cancelled = false;
    const url = `/manifest.json?vc=${Date.now()}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest: { version?: string } | null) => {
        if (cancelled || !manifest) return;
        const liveVersion = String(manifest.version ?? "").trim();
        if (liveVersion === "") return;
        const stored = (localStorage.getItem(MANIFEST_VERSION_KEY) ?? "").trim();
        if (stored === "") {
          // First time in standalone: record current version so we don’t prompt until the next update
          localStorage.setItem(MANIFEST_VERSION_KEY, liveVersion);
          return;
        }
        if (liveVersion !== stored) {
          setManifestUpdateAvailable(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isStandalone]);

  const dismissManifestUpdate = useCallback(() => {
    if (typeof window === "undefined") return;
    fetch("/manifest.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest: { version?: string } | null) => {
        if (manifest?.version != null) {
          localStorage.setItem(MANIFEST_VERSION_KEY, String(manifest.version));
        }
        setManifestUpdateAvailable(false);
      })
      .catch(() => setManifestUpdateAvailable(false));
  }, []);

  const runInstall = useCallback(
    async (onAccepted?: () => void) => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(INSTALLED_KEY, "1");
        const context = {
          installedAt: new Date().toISOString(),
          platform: getPlatform(),
        };
        localStorage.setItem(INSTALL_CONTEXT_KEY, JSON.stringify(context));
        setIsInstalled(true);
        setInstallContext(context);
        onAccepted?.();
      }
      setDeferredPrompt(null);
    },
    [deferredPrompt],
  );

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setBannerDismissed(true);
  }, []);

  const openApp = useCallback(() => {
    openAppPwa("/pwa/dashboard");
  }, []);

  // Compute canInstall and isInstalled
  const canInstall = !!deferredPrompt;
  // isInstalled: true if in standalone (definitive), otherwise trust localStorage
  // If beforeinstallprompt fired, we already cleared stale localStorage in the handler
  const computedIsInstalled = isStandalone || isInstalled;

  const value: PWAInstallContextValue = {
    canInstall,
    isInstalled: computedIsInstalled,
    isStandalone,
    runInstall,
    dismissBanner,
    bannerDismissed,
    openApp,
    installContext,
    manifestUpdateAvailable,
    dismissManifestUpdate,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall(): PWAInstallContextValue | null {
  return useContext(PWAInstallContext);
}
