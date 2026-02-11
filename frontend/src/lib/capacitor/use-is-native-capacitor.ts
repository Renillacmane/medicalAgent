"use client";

import { useEffect, useState } from "react";
import { isNativeCapacitor } from "@/lib/capacitor";

const BRIDGE_RECHECK_MS = 50;

/**
 * Quick synchronous check for Capacitor — no bridge timing dependency.
 * The "capacitor:" protocol is set before any JS runs.
 */
function quickNativeCheck(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor iOS uses "capacitor://" scheme by default (set before JS executes)
  if (window.location.protocol === "capacitor:") return true;
  // Android WebView: check for native bridge object (injected early)
  if ((window as any).androidBridge) return true;
  return false;
}

/**
 * Resolves to true when running in the Capacitor native app, false on web/PWA.
 *
 * Uses a **synchronous** check in the state initializer for the `capacitor://`
 * protocol (iOS) and `androidBridge` (Android) so the very first render already
 * knows we're native — no flash of the wrong UI.
 *
 * Falls back to an async recheck (50 ms) for cases where the bridge injects later.
 */
export function useIsNativeCapacitor(): boolean | null {
  const [value, setValue] = useState<boolean | null>(() => {
    // Synchronous check runs during useState init on the client.
    // During SSR / static export build, window is undefined → returns null.
    if (quickNativeCheck()) return true;
    return null;
  });

  useEffect(() => {
    // Already resolved — nothing to do
    if (value === true) return;

    // Full check (includes webkit messageHandlers, etc.)
    const result = isNativeCapacitor();
    if (result) {
      setValue(true);
      return;
    }

    // Bridge might inject after initial load — recheck once
    const t = setTimeout(() => {
      const finalResult = isNativeCapacitor();
      setValue(finalResult ? true : false);
    }, BRIDGE_RECHECK_MS);

    return () => clearTimeout(t);
  }, [value]);

  return value;
}
