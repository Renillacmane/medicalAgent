"use client";

import Link from "next/link";
import { useState } from "react";

export type DesignHeaderNavItem = {
  href: string;
  label: string;
};

type DesignHeaderProps = {
  title?: string;
  titleHref?: string;
  navItems?: DesignHeaderNavItem[];
};

const DEFAULT_NAV: DesignHeaderNavItem[] = [
  { href: "#buttons", label: "Buttons" },
  { href: "#cards", label: "Cards" },
  { href: "#table", label: "Table" },
  { href: "#footer", label: "Footer" },
];

/**
 * Design system: header with logo/title and nav (desktop + mobile menu).
 * Reference by name: DesignHeader
 */
export default function DesignHeader({
  title = "Design Test",
  titleHref,
  navItems = DEFAULT_NAV,
}: DesignHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-light-green-subtle/50 bg-white shadow-card">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {titleHref != null ? (
            <Link
              href={titleHref}
              className="text-xl font-semibold text-light-green-primary transition-colors hover:text-light-green-primary-dark"
            >
              {title}
            </Link>
          ) : (
            <span className="text-xl font-semibold text-light-green-primary">{title}</span>
          )}
          <nav className="hidden gap-6 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-sm font-medium text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg px-3 py-2 text-light-green-dark transition-colors hover:bg-light-green-subtle/50 active:bg-light-green-subtle"
              aria-expanded={menuOpen}
            >
              <span className="sr-only">Menu</span>
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
                {navItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-light-green-dark-grey hover:bg-light-green-light hover:text-light-green-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
