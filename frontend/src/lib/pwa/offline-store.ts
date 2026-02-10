/**
 * IndexedDB offline store for Healthia PWA.
 *
 * Database: "healthia-offline"
 * Stores:
 *   - pendingVitals : queue of vitals created while offline
 *   - cachedData    : last-known-good API responses for offline reads
 *
 * Uses the `idb` library for a typed, promise-based API.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CreateVitalPayload } from "@/types/vital";

// ---- Schema ----

export interface PendingVital {
  id?: number; // auto-increment
  payload: CreateVitalPayload;
  createdAt: string; // ISO timestamp
}

export type CachedDataKey = "vitals" | "profile" | "recommendations" | "authToken" | "apiUrl";

interface CachedDataEntry {
  key: CachedDataKey;
  data: unknown;
  updatedAt: string;
}

interface HealthiaDB extends DBSchema {
  pendingVitals: {
    key: number;
    value: PendingVital;
  };
  cachedData: {
    key: CachedDataKey;
    value: CachedDataEntry;
  };
}

// ---- Singleton DB ----

const DB_NAME = "healthia-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HealthiaDB>> | null = null;

function getDB(): Promise<IDBPDatabase<HealthiaDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on the server"));
  }
  if (!dbPromise) {
    dbPromise = openDB<HealthiaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("pendingVitals")) {
          db.createObjectStore("pendingVitals", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains("cachedData")) {
          db.createObjectStore("cachedData", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// ---- Pending Vitals (offline queue) ----

export async function addPendingVital(payload: CreateVitalPayload): Promise<number> {
  const db = await getDB();
  const entry: PendingVital = {
    payload,
    createdAt: new Date().toISOString(),
  };
  return db.add("pendingVitals", entry);
}

export async function getPendingVitals(): Promise<PendingVital[]> {
  const db = await getDB();
  return db.getAll("pendingVitals");
}

export async function removePendingVital(id: number): Promise<void> {
  const db = await getDB();
  await db.delete("pendingVitals", id);
}

export async function getPendingVitalsCount(): Promise<number> {
  const db = await getDB();
  return db.count("pendingVitals");
}

export async function clearPendingVitals(): Promise<void> {
  const db = await getDB();
  await db.clear("pendingVitals");
}

// ---- Cached Data (last-known-good API responses) ----

export async function setCachedData(key: CachedDataKey, data: unknown): Promise<void> {
  const db = await getDB();
  await db.put("cachedData", {
    key,
    data,
    updatedAt: new Date().toISOString(),
  });
}

export async function getCachedData<T = unknown>(key: CachedDataKey): Promise<T | null> {
  const db = await getDB();
  const entry = await db.get("cachedData", key);
  return (entry?.data as T) ?? null;
}

// ---- Auth token persistence (for SW Background Sync) ----

/**
 * Store the JWT so the service worker can use it during Background Sync.
 * Called after successful login or when the token is refreshed.
 */
export async function persistAuthToken(token: string): Promise<void> {
  await setCachedData("authToken", token);
}

/**
 * Remove the stored auth token (e.g. on logout) so the service worker does not use it.
 */
export async function clearAuthToken(): Promise<void> {
  const db = await getDB();
  await db.delete("cachedData", "authToken");
}

/**
 * Store the API URL so the service worker can read it.
 * Called once during app initialization.
 */
export async function persistApiUrl(url: string): Promise<void> {
  await setCachedData("apiUrl", url);
}
