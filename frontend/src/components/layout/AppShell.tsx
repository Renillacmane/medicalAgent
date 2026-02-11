"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasValidToken } from "@/lib/auth";
import { useBasePath } from "@/lib/base-path";
import { useWidgetMode } from "@/lib/widget-mode";
import { useIsNativeCapacitor } from "@/lib/capacitor/use-is-native-capacitor";
import { usePWAInstall, PWAInstallProvider } from "@/lib/pwa/install-context";
import { useMobileBrowser } from "@/lib/use-mobile-browser";
import { useIsSmallViewport } from "@/lib/use-viewport-size";
import LoadingPulse from "@/components/design/LoadingPulse";
import ManifestUpdateBanner from "@/components/pwa/ManifestUpdateBanner";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import AboutModal from "./AboutModal";
import AppNav from "./AppNav";
import Footer from "./Footer";
import Header from "./Header";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Inner shell that lives INSIDE PWAInstallProvider so it can use usePWAInstall().
 */
function AppShellInner({ children }: AppShellProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useBasePath();
  const isWidget = useWidgetMode();
  const isNative = useIsNativeCapacitor();
  const pwa = usePWAInstall(); // now correctly inside the provider
  const isMobileBrowser = useMobileBrowser();
  const isSmallViewport = useIsSmallViewport();

  // Determine if bottom menu should be shown
  const showBottomMenu = (() => {
    // Always show in Native (including when isNative is null - still checking) and widget mode
    if (isNative !== false || isWidget) return true;

    // In PWA standalone: show if format is small, else behave like desktop
    if (pwa?.isStandalone) {
      return isSmallViewport;
    }

    // In mobile browser: show bottom menu
    if (isMobileBrowser) return true;

    // Desktop: don't show bottom menu (navigation will be in Header)
    return false;
  })();

  useEffect(() => {
    if (!hasValidToken()) {
      const loginPath = `${basePath}/login`;
      const redirect = pathname ? `${loginPath}?redirect=${encodeURIComponent(pathname)}` : loginPath;
      router.replace(redirect);
      return;
    }
    setAuthChecked(true);
  }, [router, pathname, basePath]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-light-green-light">
        <LoadingPulse message="Checking session…" />
      </div>
    );
  }

  return (
    <>
      <ManifestUpdateBanner />
      <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-light-green-light">
        <OfflineBanner />
        {!isWidget && <Header showNavInDesktop={!showBottomMenu} />}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
        {!isWidget && <Footer onAboutClick={() => setAboutOpen(true)} />}
        {showBottomMenu && <AppNav />}
      </div>
      {!isWidget && <InstallPrompt />}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

/**
 * AppShell wraps in PWAInstallProvider so all children (including AppShellInner)
 * can access the PWA install context.
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <PWAInstallProvider>
      <AppShellInner>{children}</AppShellInner>
    </PWAInstallProvider>
  );
}
