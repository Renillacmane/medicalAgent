import { apiUrl } from "./config";

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
 * fetching or Server Actions we’d need auth via cookie.
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
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(url, { ...options, headers });
}

export async function authGet<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error((data as { message?: string }).message ?? "Request failed");
  }
  return data as T;
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
