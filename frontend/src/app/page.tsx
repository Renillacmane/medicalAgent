"use client";

import { Suspense, useState, useCallback } from "react";
import { useIsNativeCapacitor } from "@/lib/capacitor/use-is-native-capacitor";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/components/Dashboard";
import Widget from "@/components/Widget";
import Spinner from "@/components/ui/Spinner";
import { LoadingPulse } from "@/components/design";
import { apiUrl } from "@/lib/config";

type EngineStatus = "red" | "loading" | "green";

export default function Home() {
  const isNative = useIsNativeCapacitor();
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("red");

  const startEngine = useCallback(async () => {
    setEngineStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/health`);
      setEngineStatus(res.ok ? "green" : "red");
    } catch {
      setEngineStatus("red");
    }
  }, []);

  // Only use AppShell when we know we're in the native app (isNative === true).
  // When isNative is null (still resolving) or false (web), show the landing page so we
  // don't trigger AppShell's auth check and redirect to login on reload.
  if (isNative === true) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-4" aria-busy="true">
            <Spinner />
          </div>
        }
      >
        <AppShell>
          <Dashboard />
        </AppShell>
      </Suspense>
    );
  }

  const engineStatusIndicator =
    engineStatus === "loading" ? (
      <div className="flex items-center gap-1" aria-busy="true" aria-live="polite">
        <LoadingPulse className="flex flex-row gap-1 items-center" />
      </div>
    ) : (
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${engineStatus === "green" ? "bg-green-500" : "bg-red-500"}`}
        aria-hidden
      />
    );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Healthia</h1>
          {engineStatusIndicator}
          <button
            type="button"
            onClick={startEngine}
            disabled={engineStatus === "loading"}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Start Engine
          </button>
        </div>

        <p className="mb-6 text-slate-600 leading-relaxed">
          Healthia is your personal health companion. It helps you track vitals, medications, and
          daily check-ins, and delivers gentle, non-critical recommendations to support your
          wellbeing. Quick access to your dashboard, add new entries, and manage your profile from
          anywhere.
        </p>

        <p className="mt-6 text-sm text-slate-500">
          Click the &quot;Hi&quot; button in the bottom right to open the widget and sign in.
        </p>
      </div>

      <Widget />
    </main>
  );
}
