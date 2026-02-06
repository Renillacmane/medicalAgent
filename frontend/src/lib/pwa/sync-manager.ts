/**
 * Offline vitals sync manager.
 *
 * Drains the pendingVitals queue in IndexedDB by POSTing each entry
 * to the backend. Successful entries are removed; failures are left
 * for the next attempt.
 *
 * Triggered by:
 *   1. SW Background Sync event ("sync-vitals")
 *   2. Window "online" event listener
 *   3. AddVitalsForm mount (catch any missed syncs)
 */

import { authPost, UnauthorizedError } from "@/lib/api";
import {
  getPendingVitals,
  removePendingVital,
  type PendingVital,
} from "./offline-store";

/** Result of a sync attempt. */
export interface SyncResult {
  synced: number;
  failed: number;
  authExpired: boolean;
}

let syncing = false;

/**
 * Drain all pending vitals. Safe to call multiple times —
 * concurrent calls are de-duplicated.
 */
export async function syncPendingVitals(): Promise<SyncResult> {
  if (syncing) return { synced: 0, failed: 0, authExpired: false };
  syncing = true;

  const result: SyncResult = { synced: 0, failed: 0, authExpired: false };

  try {
    const pending: PendingVital[] = await getPendingVitals();
    if (pending.length === 0) return result;

    for (const entry of pending) {
      try {
        await authPost("/patients/vitals", entry.payload);
        if (entry.id != null) {
          await removePendingVital(entry.id);
        }
        result.synced++;
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          result.authExpired = true;
          break; // Stop – token expired, user must re-login
        }
        result.failed++;
        // Leave in queue for next attempt
      }
    }
  } finally {
    syncing = false;
  }

  return result;
}

/**
 * Request Background Sync registration so the SW fires `sync-vitals`
 * when connectivity returns. Falls back to no-op if the API is unavailable.
 */
export async function requestBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    // Background Sync API — not available in all browsers
    if ("sync" in reg) {
      await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-vitals");
    }
  } catch {
    // Background Sync not supported or denied – that's fine,
    // the "online" event listener will handle sync instead.
  }
}
