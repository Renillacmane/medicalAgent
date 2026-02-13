"use client";

/** Navigation tab identifiers. Use this enum when referring to a tab (e.g. styling, routing). */
export enum NavTabId {
  Dashboard = "dashboard",
  Add = "add",
  Recommendations = "recommendations",
  MyHealth = "my-health",
  Profile = "profile",
}

export interface NavTab {
  id: NavTabId;
  label: string;
  href: string;
}

export const NAV_TABS: NavTab[] = [
  { id: NavTabId.Dashboard, label: "Dashboard", href: "/dashboard" },
  { id: NavTabId.Add, label: "Add", href: "/add" },
  { id: NavTabId.Recommendations, label: "Recommendations", href: "/recommendations" },
  { id: NavTabId.MyHealth, label: "My Health", href: "/my-health" },
  { id: NavTabId.Profile, label: "My profile", href: "/profile" },
];

const NAV_ICON_SVG_PATHS: Record<NavTabId, string> = {
  [NavTabId.Dashboard]:
    "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  [NavTabId.Add]: "M12 4v16m8-8H4",
  [NavTabId.Recommendations]:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  [NavTabId.MyHealth]:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  [NavTabId.Profile]:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

export function NavIcon({ id }: { id: NavTabId }) {
  const d = NAV_ICON_SVG_PATHS[id];
  if (!d) return null;
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}
