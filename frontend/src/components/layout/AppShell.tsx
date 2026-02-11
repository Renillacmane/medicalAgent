"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasValidToken } from "@/lib/auth";
import { useBasePath } from "@/lib/base-path";
import { useWidgetMode } from "@/lib/widget-mode";
import LoadingPulse from "@/components/design/LoadingPulse";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { PWAInstallProvider } from "@/lib/pwa/install-context";
import AboutModal from "./AboutModal";
import AppNav from "./AppNav";
import Footer from "./Footer";
import Header from "./Header";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useBasePath();
  const isWidget = useWidgetMode();

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
      <PWAInstallProvider>
        <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-light-green-light">
          <OfflineBanner />
          {!isWidget && <Header />}
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
          {!isWidget && <Footer onAboutClick={() => setAboutOpen(true)} />}
          <AppNav />
        </div>
        {!isWidget && <InstallPrompt />}
      </PWAInstallProvider>
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
