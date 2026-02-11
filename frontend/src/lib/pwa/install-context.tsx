"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
};

const DISMISSED_KEY = "healthia-install-dismissed";
const INSTALLED_KEY = "healthia-pwa-installed";
const INSTALL_CONTEXT_KEY = "healthia-pwa-install-context";

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

  useEffect(() => {
    setIsInstalled(readInstalled());
    setInstallContext(readInstallContext());
    setBannerDismissed(readBannerDismissed());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const mqMinimal = window.matchMedia("(display-mode: minimal-ui)");
    const mqFullscreen = window.matchMedia("(display-mode: fullscreen)");
    const check = () =>
      setIsStandalone(mq.matches || mqMinimal.matches || mqFullscreen.matches);
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

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
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
    window.location.href = "/pwa/dashboard";
  }, []);

  const value: PWAInstallContextValue = {
    canInstall: !!deferredPrompt,
    isInstalled,
    isStandalone,
    runInstall,
    dismissBanner,
    bannerDismissed,
    openApp,
    installContext,
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
