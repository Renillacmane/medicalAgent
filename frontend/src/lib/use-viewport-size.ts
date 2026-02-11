"use client";

import { useEffect, useState } from "react";

/**
 * Detects if the viewport is small (mobile-sized).
 * Uses Tailwind's `sm` breakpoint (640px) as the threshold.
 */
export function useIsSmallViewport(): boolean {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSize = () => {
      setIsSmall(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isSmall;
}
