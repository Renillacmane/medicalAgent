"use client";

import { useIsNativeCapacitor } from "@/lib/capacitor/use-is-native-capacitor";
import { useIsWidget } from "@/lib/widget-mode";
import { useMobileBrowser } from "@/lib/use-mobile-browser";
import { useIsSmallViewport } from "@/lib/use-viewport-size";
import { usePWAInstall } from "@/lib/pwa/install-context";

/**
 * True when the app should use compact layout: bottom nav bar + minimal header.
 * Used for display only (layout/chrome), not for auth or business logic.
 *
 * Compact when:
 * - Widget context (iframe or ?widget=1),
 * - Native Capacitor app,
 * - Mobile browser (phone/tablet UA + touch),
 * - Small viewport (desktop window resized below sm breakpoint),
 * - PWA standalone with small viewport.
 */
export function useCompactMode(): boolean {
  const isWidget = useIsWidget();
  const isNative = useIsNativeCapacitor();
  const pwa = usePWAInstall();
  const isMobileBrowser = useMobileBrowser();
  const isSmallViewport = useIsSmallViewport();

  if (isWidget) return true;
  if (isNative !== false) return true;
  if (pwa?.isStandalone) return isSmallViewport;
  if (isMobileBrowser) return true;
  if (isSmallViewport) return true;
  return false;
}
