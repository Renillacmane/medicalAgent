"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authGet, UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatBP } from "@/lib/vital-format";
import type { Vital } from "@/types/vital";
import PageLoading from "@/components/ui/PageLoading";

export default function Dashboard() {
  const router = useRouter();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authGet<Vital[]>("/patients/vitals?limit=20")
      .then((data) => {
        if (!cancelled) setVitals(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace("/login?redirect=/dashboard");
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
  }, [router]);

  return (
    <div className="p-4">
      <p className="text-slate-800 font-medium">Welcome back.</p>
      <p className="mt-1 text-sm text-slate-500">
        Your dashboard and recent vitals.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">Recent Vitals</h2>
        {loading && (
          <div className="mt-2">
            <PageLoading message="Loading vitals…" className="min-h-[8rem]" />
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && vitals.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            No vitals yet. Add some from the Add tab.
          </p>
        )}
        {!loading && !error && vitals.length > 0 && (
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-700">Date</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Heart rate</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Blood pressure</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Weight</th>
                  <th className="px-3 py-2 font-medium text-slate-700">BMI</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Sleep (h)</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Stress</th>
                  <th className="px-3 py-2 font-medium text-slate-700">SpO₂</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Glucose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitals.map((v) => (
                  <tr key={v.id ?? v.date} className="text-slate-700">
                    <td className="whitespace-nowrap px-3 py-2">{formatDate(v.date, "short")}</td>
                    <td className="px-3 py-2">{v.heartRate != null ? `${v.heartRate} bpm` : "—"}</td>
                    <td className="px-3 py-2">{formatBP(v.bloodPressure)}</td>
                    <td className="px-3 py-2">{v.weight != null ? `${v.weight} kg` : "—"}</td>
                    <td className="px-3 py-2">{v.bmi != null ? v.bmi : "—"}</td>
                    <td className="px-3 py-2">{v.sleepHours != null ? v.sleepHours : "—"}</td>
                    <td className="px-3 py-2">{v.stressPerception != null ? v.stressPerception : "—"}</td>
                    <td className="px-3 py-2">{v.bloodOxygen != null ? `${v.bloodOxygen}%` : "—"}</td>
                    <td className="px-3 py-2">{v.bloodGlucose != null ? v.bloodGlucose : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
