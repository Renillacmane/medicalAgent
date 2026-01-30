"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-config";
import { NavIcon } from "./nav-config";

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex shrink-0 border-t border-slate-200 bg-slate-50/80"
      aria-label="App navigation"
    >
      {NAV_TABS.map(({ id, label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={id}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive ? "text-slate-800 font-medium" : "text-slate-500 hover:text-slate-700"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <NavIcon icon={icon} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
