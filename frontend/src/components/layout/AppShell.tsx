"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { hasValidToken } from "@/lib/auth";
import { useBasePath } from "@/lib/base-path";
import { useIsWidget } from "@/lib/widget-mode";
import { useCompactMode } from "@/lib/use-compact-mode";
import { useIsNativeCapacitor } from "@/lib/capacitor/use-is-native-capacitor";
import { initNativePushNotifications } from "@/lib/push-notifications";
import { syncPendingVitals } from "@/lib/pwa/sync-manager";
import { PWAInstallProvider } from "@/lib/pwa/install-context";
import { LoadingPulse } from "@/components/design";
import ManifestUpdateBanner from "@/components/pwa/ManifestUpdateBanner";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import VitalsCatchUpBubble from "@/components/notifications/VitalsCatchUpBubble";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import DesignFooter from "@/components/design/DesignFooter";
import GoToTop from "@/components/design/GoToTop";
import AboutModal from "./AboutModal";
import AppNav from "./AppNav";
import Header from "./Header";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Inner shell that lives INSIDE PWAInstallProvider so it can use usePWAInstall().
 */
function AppShellInner({ children }: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useBasePath();
  const isWidget = useIsWidget();
  const isCompact = useCompactMode();
  const isNative = useIsNativeCapacitor();

  // for future reference
  // const pwa = usePWAInstall(); // now correctly inside the provider
  // const isMobileBrowser = useMobileBrowser();
  // const isSmallViewport = useIsSmallViewport();

  // // Determine if bottom menu should be shown
  // const showBottomMenu = (() => {
  //   // Always show in Native (including when isNative is null - still checking) and widget mode
  //   if (isNative !== false || isWidget) return true;

  //   // In PWA standalone: show if format is small, else behave like desktop
  //   if (pwa?.isStandalone) {
  //     return isSmallViewport;
  //   }

  //   // In mobile browser: show bottom menu
  //   if (isMobileBrowser) return true;

  //   // Desktop: don't show bottom menu (navigation will be in Header)
  //   return false;
  // })();

  useEffect(() => {
    if (!hasValidToken()) {
      const loginPath = `${basePath}/login`;
      const redirect = pathname ? `${loginPath}?redirect=${encodeURIComponent(pathname)}` : loginPath;
      router.replace(redirect);
      return;
    }
    setAuthChecked(true);
  }, [router, pathname, basePath]);

  useEffect(() => {
    if (!authChecked || isNative !== true) return;
    initNativePushNotifications().catch(() => {
      // Best-effort: failures should not block the app shell.
    });
  }, [authChecked, isNative]);

  // When app returns to foreground (native only), drain pending vitals queue.
  useEffect(() => {
    if (isNative !== true) return;

    let cancelled = false;
    let handle: { remove: () => Promise<void> } | null = null;

    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        syncPendingVitals().catch(() => {
          // Best-effort: failures leave queued vitals for next attempt.
        });
      }
    }).then((h) => {
      if (cancelled) {
        h.remove().catch(() => {});
      } else {
        handle = h;
      }
    });

    return () => {
      cancelled = true;
      handle?.remove().catch(() => {});
    };
  }, [isNative]);

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
        {!isWidget && (
          <Header
            showNavInDesktop={!isCompact}
            isCompact={isCompact}
            onAboutClick={() => setAboutOpen(true)}
          />
        )}
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <VitalsCatchUpBubble />
          {children}
        </main>
        {!isWidget && !isCompact && (
          <DesignFooter
            title={
              <>
                {'"'}Big Things Happen When You Do the Little Things Right{'"'}
                <span className="text-light-green-dark-grey"> — Don Gabor</span>
              </>
            }
            links={[]}
            onAboutClick={() => setAboutOpen(true)}
            copyright="© 2026 Medical Agent. Your trusted health companion."
            withTopMargin={false}
          />
        )}
        {!isWidget && <GoToTop scrollContainerRef={mainRef} bottomOffset={isCompact ? "5rem" : "1.5rem"} />}
        {isCompact && <AppNav />}
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
