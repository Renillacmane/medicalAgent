/**
 * Frontend config from environment.
 * Uses API_URL (ensure it is exposed to the client if needed, e.g. via next.config or runtime).
 */
export const apiUrl = process.env.API_URL ?? "http://localhost:3911";
