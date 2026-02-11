"use client";

import { useEffect, useState } from "react";

/**
 * Detects if the app is running in a mobile browser (not native app, not desktop).
 * Uses user agent detection combined with touch capability.
 *
 * Note: iPadOS 13+ reports its UA as "Macintosh" (desktop Safari), so we detect it
 * via the combination of "Macintosh" UA + multi-touch support (maxTouchPoints > 1).
 */
export function useMobileBrowser(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    const isMobileUA =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // iPadOS 13+ pretends to be macOS desktop Safari, but still has multi-touch
    const isIPadOS =
      /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;

    // Mobile browser: (mobile UA + touch) OR iPadOS
    setIsMobile((isMobileUA && hasTouch) || isIPadOS);
  }, []);

  return isMobile;
}
