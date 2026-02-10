"use client";

import { useEffect, useState } from "react";
import { isNativeCapacitor } from "@/lib/capacitor";

const BRIDGE_RECHECK_MS = 50;

/**
 * Resolves to true when running in the Capacitor native app, false on web/PWA.
 * Returns null briefly until the bridge is available (native bridge can inject after load).
 * Use to avoid showing web-only UI (e.g. test page) in the native app.
 */
export function useIsNativeCapacitor(): boolean | null {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    const result = isNativeCapacitor();
    if (result) {
      setValue(true);
      return;
    }
    const t = setTimeout(() => setValue(isNativeCapacitor()), BRIDGE_RECHECK_MS);
    return () => clearTimeout(t);
  }, []);

  return value;
}
