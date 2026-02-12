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

    let prevValue = false;
    const checkSize = () => {
      const newValue = window.innerWidth < 640; // Tailwind's sm breakpoint
      if (newValue !== prevValue) {
        prevValue = newValue;
      }
      setIsSmall(newValue);
    };

    checkSize(); // Initial check
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isSmall;
}
