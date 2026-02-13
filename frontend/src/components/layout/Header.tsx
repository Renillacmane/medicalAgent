"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { NAV_TABS, NavTabId } from "./nav-config";
import InstallButton from "@/components/pwa/InstallButton";
import UserMenu from "./UserMenu";

type HeaderProps = {
  onClose?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  showNavInDesktop?: boolean;
};

export default function Header({ onClose, onBack, showBack, showNavInDesktop = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const basePath = useBasePath();

  // Close mobile menu when route changes (e.g. after clicking My profile)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="shrink-0 border-b border-light-green-subtle/50 bg-white shadow-card">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {showBack && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="shrink-0 rounded-lg p-1.5 text-light-green-dark-grey transition-colors hover:bg-light-green-light/50 hover:text-light-green-primary"
                aria-label="Go back"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="truncate text-lg font-semibold text-light-green-primary">Healthia</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showNavInDesktop && (
              <>
                {/* Desktop navigation: main tabs (no Profile) + user menu */}
                <nav className="hidden gap-6 sm:flex sm:items-center">
                  <InstallButton />
                  {NAV_TABS.filter((tab) => tab.id !== NavTabId.Profile).map((tab) => {
                    const fullHref = basePath + tab.href;
                    const isActive = pathname === fullHref;
                    const isHighlightTab = tab.id === NavTabId.Recommendations || tab.id === NavTabId.MyHealth;
                    return (
                      <Link
                        key={tab.id}
                        href={fullHref}
                        className={`text-sm font-medium transition-colors ${
                          isActive
                            ? isHighlightTab
                              ? "text-light-green-primary"
                              : "text-slate-800"
                            : "text-light-green-dark-grey hover:text-light-green-primary"
                        }`}
                      >
                        {tab.label}
                      </Link>
                    );
                  })}
                  <UserMenu variant="desktop" />
                </nav>
                {/* Mobile sandwich menu */}
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-lg p-2 text-light-green-dark-grey transition-colors hover:bg-light-green-light/50 hover:text-light-green-primary"
                    aria-expanded={menuOpen}
                    aria-label="Menu"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {menuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-light-green-subtle bg-white py-2 shadow-card-hover">
                      <div className="px-4 py-2">
                        <InstallButton />
                      </div>
                      {NAV_TABS.filter((tab) => tab.id !== NavTabId.Profile).map((tab) => {
                        const fullHref = basePath + tab.href;
                        const isActive = pathname === fullHref;
                        const isHighlightTab = tab.id === NavTabId.Recommendations || tab.id === NavTabId.MyHealth;
                        return (
                          <Link
                            key={tab.id}
                            href={fullHref}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-2 text-sm transition-colors hover:bg-light-green-light ${
                              isActive
                                ? isHighlightTab
                                  ? "text-light-green-primary font-medium"
                                  : "text-slate-800 font-medium"
                                : "text-light-green-dark-grey hover:text-light-green-primary"
                            }`}
                          >
                            {tab.label}
                          </Link>
                        );
                      })}
                      <UserMenu variant="mobile" />
                    </div>
                  )}
                </div>
              </>
            )}
            {!showNavInDesktop && <InstallButton />}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-light-green-dark-grey transition-colors hover:bg-light-green-light/50 hover:text-light-green-primary"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
