"use client";

import { usePathname } from "next/navigation";

const PWA_PREFIX = "/pwa";

/**
 * Base path for app routes when running under /pwa (PWA window).
 * Use for links and redirects so navigation stays in the same context.
 * - On /dashboard, /add, etc. → ""
 * - On /pwa/dashboard, /pwa/add, etc. → "/pwa"
 */
export function useBasePath(): string {
  const pathname = usePathname();
  return pathname?.startsWith(PWA_PREFIX) ? PWA_PREFIX : "";
}
