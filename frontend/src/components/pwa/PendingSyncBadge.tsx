"use client";

import { useOnlineStatus } from "@/lib/pwa/use-online-status";

/**
 * Small numeric badge displayed on the "Add" nav tab icon
 * when there are vitals queued for offline sync.
 * Disappears when the count reaches 0.
 */
export default function PendingSyncBadge() {
  const { pendingCount } = useOnlineStatus();

  if (pendingCount === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
      {pendingCount > 99 ? "99+" : pendingCount}
    </span>
  );
}
