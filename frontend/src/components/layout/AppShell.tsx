"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasValidToken } from "@/lib/auth";
import RhombusLoader from "@/components/ui/RhombusLoader";
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

  useEffect(() => {
    if (!hasValidToken()) {
      const redirect = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirect);
      return;
    }
    setAuthChecked(true);
  }, [router, pathname]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <RhombusLoader size={44} />
        <p className="text-sm text-slate-500">Checking session…</p>
      </div>
    );
  }

  return (
    <>
      <PWAInstallProvider>
        <div className="flex h-dvh min-h-screen flex-col overflow-hidden">
          <OfflineBanner />
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
          <Footer onAboutClick={() => setAboutOpen(true)} />
          <AppNav />
        </div>
        <InstallPrompt />
      </PWAInstallProvider>
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
