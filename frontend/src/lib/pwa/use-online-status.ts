"use client";

/**
 * React hook: online/offline status + pending vitals count.
 *
 * Returns { isOnline: boolean; pendingCount: number }
 *
 * On native (Capacitor): uses @capacitor/network for reliable connectivity
 * detection and syncs when status changes to connected.
 * On web/PWA: listens to window online/offline events.
 * Polls the pending vitals count from IndexedDB in both cases.
 */

import { useCallback, useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { isNativeCapacitor } from "@/lib/capacitor";
import { getPendingVitalsCount } from "./offline-store";
import { syncPendingVitals } from "./sync-manager";

export interface OnlineStatus {
  isOnline: boolean;
  pendingCount: number;
}

/** Refresh interval for the pending count (ms). */
const POLL_INTERVAL = 5_000;

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState(0);

  // Refresh the pending count from IndexedDB
  const refreshCount = useCallback(async () => {
    try {
      const count = await getPendingVitalsCount();
      setPendingCount(count);
    } catch {
      // IDB unavailable – ignore
    }
  }, []);

  useEffect(() => {
    const handleConnected = () => {
      setIsOnline(true);
      syncPendingVitals().then(() => refreshCount());
    };

    const handleDisconnected = () => {
      setIsOnline(false);
    };

    if (isNativeCapacitor()) {
      // Native: use @capacitor/network for more reliable connectivity detection
      let cancelled = false;
      let handle: { remove: () => Promise<void> } | null = null;

      Network.getStatus()
        .then((s) => {
          if (!cancelled) setIsOnline(s.connected);
        })
        .catch(() => {});

      Network.addListener("networkStatusChange", (status) => {
        if (cancelled) return;
        setIsOnline(status.connected);
        if (status.connected) {
          syncPendingVitals().then(() => refreshCount());
        }
      }).then((h) => {
        if (!cancelled) handle = h;
      });

      refreshCount();
      const interval = setInterval(refreshCount, POLL_INTERVAL);

      return () => {
        cancelled = true;
        handle?.remove().catch(() => {});
        clearInterval(interval);
      };
    }

    // Web/PWA: use window online/offline events
    const handleOnline = () => handleConnected();
    const handleOffline = () => handleDisconnected();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  return { isOnline, pendingCount };
}
