/**
 * Client-side auth helpers. Token is in localStorage (client-only).
 * Use hasValidToken() before loading protected pages to redirect if session is lost.
 */

const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Decode JWT payload and check exp (expiry in seconds).
 * No signature verification – used only to avoid starting requests with an obviously expired token.
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    if (payload.exp == null) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Returns true if there is a token and it is not expired.
 * Use this before loading any protected page; if false, redirect to login.
 */
export function hasValidToken(): boolean {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Clear the auth token from localStorage and from the offline store (so the SW
 * does not use it). Call this on logout.
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}
