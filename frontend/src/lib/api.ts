import { apiUrl } from "./config";
import {
  setCachedData,
  getCachedData,
  type CachedDataKey,
} from "./pwa/offline-store";

/** Thrown when the API returns 401; use to redirect to login. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Please sign in again.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Client-side auth API helpers. Token is read from localStorage (client-only),
 * so data fetching runs in Client Components (useEffect). For server-side
 * fetching or Server Actions we'd need auth via cookie.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const url = path.startsWith("http") ? path : `${apiUrl}${path}`;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Only set Content-Type for JSON if not already set and not FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...options, headers });
}

// ---- Mapping from API path to IndexedDB cache key ----

function cacheKeyForPath(path: string): CachedDataKey | null {
  if (path.includes("/patients/vitals")) return "vitals";
  if (path.includes("/patients/profile")) return "profile";
  if (path.includes("/recommendations/daily")) return "recommendations";
  return null;
}

export async function authGet<T>(path: string): Promise<T> {
  const cacheKey = cacheKeyForPath(path);

  try {
    const res = await authFetch(path);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) throw new UnauthorizedError();
      throw new Error((data as { message?: string }).message ?? "Request failed");
    }
    // Cache successful GET responses in IndexedDB for offline use
    if (cacheKey) {
      setCachedData(cacheKey, data).catch(() => {
        /* IDB write failure is non-critical */
      });
    }
    return data as T;
  } catch (err) {
    // If it's an auth error, don't fall back to cache
    if (err instanceof UnauthorizedError) throw err;

    // Network failure – try to serve from IndexedDB cache
    if (cacheKey) {
      const cached = await getCachedData<T>(cacheKey).catch(() => null);
      if (cached != null) return cached;
    }
    throw err;
  }
}

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(path, { method: "POST", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error((data as { message?: string }).message ?? "Request failed");
  }
  return data as T;
}

export async function authPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await authFetch(path, { method: "PATCH", body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error((data as { message?: string }).message ?? "Request failed");
  }
  return data as T;
}

export async function authDelete<T>(path: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, {
    method: "DELETE",
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error((data as { message?: string }).message ?? "Request failed");
  }
  return data as T;
}

export async function authPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await authFetch(path, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error((data as { message?: string }).message ?? "Request failed");
  }
  return data as T;
}
