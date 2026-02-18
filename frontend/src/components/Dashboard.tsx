"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { LoadingPulse } from "@/components/design";
import { UnauthorizedError } from "@/lib/api";
import { getVitals } from "@/services/patients.service";
import { formatDate } from "@/lib/format";
import { formatBP } from "@/lib/vital-format";
import type { Vital } from "@/types/vital";

export default function Dashboard() {
  const router = useRouter();
  const basePath = useBasePath();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const wasOnline = navigator.onLine;

    getVitals({ limit: 20 })
      .then((data) => {
        if (!cancelled) {
          setVitals(Array.isArray(data) ? data : []);
          if (!wasOnline) setFromCache(true);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/dashboard")}`);
            return;
          }
          setError(e instanceof Error ? e.message : "Failed to load vitals");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router, basePath]);

  return (
    <div className="min-h-screen bg-light-green-light px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-light-green-dark">Welcome back</h1>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          Your dashboard and recent vitals.
        </p>

        <div className="mt-4">
          <Link
            href={`${basePath}/design`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-light-green-primary underline-offset-2 transition-colors hover:underline active:text-light-green-primary-dark"
          >
            Design page
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-light-green-dark">Recent vitals</h2>
          {fromCache && (
            <p className="mt-1 text-xs text-amber-600">
              Showing cached data — you appear to be offline.
            </p>
          )}
          {loading && (
            <div className="mt-6 rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card">
              <LoadingPulse message="Loading vitals…" />
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
          )}
          {!loading && !error && vitals.length === 0 && (
            <div className="mt-6 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
              <p className="text-sm text-light-green-dark-grey">
                No vitals yet. Add some from the Add tab.
              </p>
              <Link
                href={`${basePath}/add`}
                className="mt-4 inline-block text-sm font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline"
              >
                Add vitals →
              </Link>
            </div>
          )}
          {!loading && !error && vitals.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-xl border border-light-green-subtle/60 bg-white shadow-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-light-green-subtle/80 bg-light-green-light/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Date</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Heart rate</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Blood pressure</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Weight</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">BMI</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Sleep (h)</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Stress</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">SpO₂</th>
                    <th className="px-4 py-3 font-semibold text-light-green-dark">Glucose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-green-subtle/40">
                  {vitals.map((v) => (
                    <tr key={v.id ?? v.date} className="transition-colors hover:bg-light-green-light/40">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-light-green-dark">{formatDate(v.date, "short")}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.heartRate != null ? `${v.heartRate} bpm` : "—"}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{formatBP(v.bloodPressure)}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.weight != null ? `${v.weight} kg` : "—"}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.bmi != null ? v.bmi : "—"}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.sleepHours != null ? v.sleepHours : "—"}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.stressPerception != null ? v.stressPerception : "—"}</td>
                      <td className="px-4 py-3 text-light-green-dark-grey">{v.bloodOxygen != null ? `${v.bloodOxygen}%` : "—"}</td>
                      <td className="px-4 py-3 text-light-green-light-grey">{v.bloodGlucose != null ? v.bloodGlucose : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
