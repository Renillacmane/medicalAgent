"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { NAV_TABS, NavTabId, NavIcon } from "./nav-config";
import PendingSyncBadge from "@/components/pwa/PendingSyncBadge";

export default function AppNav() {
  const pathname = usePathname();
  const basePath = useBasePath();

  return (
    <nav
      className="flex shrink-0 border-t border-slate-200 bg-slate-50/80"
      aria-label="App navigation"
    >
      {NAV_TABS.map(({ id, label, href }) => {
        const fullHref = basePath + href;
        const isActive = pathname === fullHref;
        const isRecommendations = id === NavTabId.Recommendations;
        return (
          <Link
            key={id}
            href={fullHref}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive
                ? isRecommendations
                  ? "font-medium text-light-green-primary"
                  : "text-slate-800 font-medium"
                : "text-slate-500 hover:text-slate-700"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="relative">
              <NavIcon id={id} />
              {id === NavTabId.Add && <PendingSyncBadge />}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
