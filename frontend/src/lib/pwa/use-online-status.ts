"use client";

/**
 * React hook: online/offline status + pending vitals count.
 *
 * Returns { isOnline: boolean; pendingCount: number }
 *
 * Listens to window online/offline events and polls the pending
 * vitals count from IndexedDB.
 */

import { useCallback, useEffect, useState } from "react";
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
    const handleOnline = () => {
      setIsOnline(true);
      // Eagerly attempt to sync when we come back online
      syncPendingVitals().then(() => refreshCount());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial count
    refreshCount();

    // Poll periodically (handles cases where sync finishes in the SW)
    const interval = setInterval(refreshCount, POLL_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  return { isOnline, pendingCount };
}
