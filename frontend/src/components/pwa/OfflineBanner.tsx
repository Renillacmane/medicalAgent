"use client";

import { useOnlineStatus } from "@/lib/pwa/use-online-status";

/**
 * Thin amber banner shown at the top of the app when the user is offline.
 * Automatically disappears when connectivity returns.
 */
export default function OfflineBanner() {
  const { isOnline, pendingCount } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="shrink-0 bg-amber-500 px-3 py-1.5 text-center text-xs font-medium text-white"
    >
      You are offline.
      {pendingCount > 0
        ? ` ${pendingCount} vital${pendingCount > 1 ? "s" : ""} queued for sync.`
        : " Vitals you add will be saved and synced automatically."}
    </div>
  );
}
