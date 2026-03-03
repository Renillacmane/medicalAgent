"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/config";
import { persistAuthToken, persistApiUrl } from "@/lib/pwa/offline-store";

type Props = { onSuccess?: () => void };

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      if (data.access_token) {
        typeof window !== "undefined" && localStorage.setItem("access_token", data.access_token);
        // Persist token and API URL to IndexedDB so the SW can use them for Background Sync
        persistAuthToken(data.access_token).catch(() => {});
        persistApiUrl(apiUrl).catch(() => {});
      }
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(
        `Cannot reach server at ${apiUrl}. Check that the backend is running and API_URL matches the backend port (default 3911).`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-light-green-dark">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-light-green-subtle/60 bg-white px-4 py-2.5 text-light-green-dark shadow-sm transition-colors focus:border-light-green-primary focus:outline-none focus:ring-1 focus:ring-light-green-primary/50"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-light-green-dark">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-light-green-subtle/60 bg-white px-4 py-2.5 text-light-green-dark shadow-sm transition-colors focus:border-light-green-primary focus:outline-none focus:ring-1 focus:ring-light-green-primary/50"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark hover:shadow-card-hover active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
