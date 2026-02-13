"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { authGet, UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getLast7DaysVitals } from "@/lib/last7-days-vitals";
import type { Vital } from "@/types/vital";
import type { PatientProfile } from "@/types/profile";
import type {
  DailyRecommendationResponse,
  RecommendationCategory,
  VitalChartKey,
} from "@/types/recommendations";
import { RECOMMENDATION_VITALS, RECOMMENDATION_LABELS, type ChartSeries } from "@/types/recommendations";
import RhombusLoader from "@/components/ui/RhombusLoader";
import VitalsLineChart from "@/components/recommendations/VitalsLineChart";
import UserPanel from "@/components/health/UserPanel";
import HealthyValuesPanel from "@/components/recommendations/HealthyValuesPanel";

const RECOMMENDATION_TYPES: RecommendationCategory[] = ["nutrition", "exercise", "lifestyle", "alerts"];

const VITAL_LABELS: Record<VitalChartKey, string> = {
  heartRate: "Heart rate",
  weight: "Weight",
  bmi: "BMI",
  sleepHours: "Sleep (h)",
  stressPerception: "Stress",
  bloodOxygen: "SpO₂",
  bloodGlucose: "Glucose",
  bloodPressureSystolic: "BP (sys)",
};

function getVitalValue(v: Vital, key: VitalChartKey): number | null {
  if (key === "bloodPressureSystolic") {
    const n = v.bloodPressure?.systolic;
    return n != null ? n : null;
  }
  const val = (v as Record<string, unknown>)[key];
  return typeof val === "number" ? val : null;
}

function buildChartData(
  last7: { vitalsByDay: (Vital | null)[]; dateKeys: string[] },
  type: RecommendationCategory,
): { labels: string[]; series: ChartSeries[] } {
  const keys = RECOMMENDATION_VITALS[type];
  const { vitalsByDay, dateKeys } = last7;
  const labels =
    dateKeys.length > 0
      ? dateKeys.map((k) => (k === "—" ? k : formatDate(k, "short")))
      : ["—", "—", "—", "—", "—", "—", "—"];
  const series: ChartSeries[] = keys.map((key) => ({
    label: VITAL_LABELS[key],
    values: vitalsByDay.map((v) => (v ? getVitalValue(v, key) : null)),
  }));
  return { labels, series };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const basePath = useBasePath();
  const [recommendations, setRecommendations] = useState<DailyRecommendationResponse | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedTypes, setLoadedTypes] = useState<RecommendationCategory[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      authGet<DailyRecommendationResponse>("/recommendations/daily").catch((e) => {
        if (e instanceof UnauthorizedError) return null;
        throw e;
      }),
      authGet<PatientProfile>("/patients/profile").catch((e) => {
        if (e instanceof UnauthorizedError) return null;
        return null;
      }),
      authGet<Vital[]>("/patients/vitals?days=14&limit=50").catch((e) => {
        if (e instanceof UnauthorizedError) return [];
        return [] as Vital[];
      }),
    ])
      .then(([rec, prof, vits]) => {
        if (cancelled) return;
        if (rec) setRecommendations(rec);
        if (prof) setProfile(prof);
        if (Array.isArray(vits)) setVitals(vits);
        RECOMMENDATION_TYPES.forEach((type, i) => {
          setTimeout(() => {
            if (!cancelled) setLoadedTypes((prev) => [...prev, type]);
          }, i * 280);
        });
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/recommendations")}`);
            return;
          }
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router, basePath]);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green-light pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold text-light-green-dark">Recommendations</h1>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          Personalized by type with related vitals from the last 7 days.
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left: user media + latest data (last 7 calendar days from latest vital) */}
          <UserPanel
            profile={profile}
            vitals={vitals}
            last7DaysVitals={getLast7DaysVitals(vitals)}
          />

          {/* Center: overall score + recommendations and graphs */}
          <main className="min-w-0 flex-1 space-y-6">
            <section
              className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card"
              aria-label="Overall score placeholder"
            >
              <h2 className="text-sm font-medium text-light-green-dark-grey">Overall score</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-light-green-primary">—</span>
                <span className="text-sm text-light-green-light-grey">(coming soon)</span>
              </div>
              <p className="mt-2 text-xs text-light-green-light-grey">
                A single wellness score will be added here once we choose an appropriate algorithm.
              </p>
            </section>

            <div className="space-y-6">
              {RECOMMENDATION_TYPES.map((type) => {
                const isLoaded = loadedTypes.includes(type);
                const items = recommendations?.recommendations?.[type] ?? [];
                const last7 = getLast7DaysVitals(vitals);
                const { labels, series } = buildChartData(last7, type);

                return (
                  <section key={type} className="space-y-2">
                    <h3 className="text-base font-semibold text-light-green-dark">
                      {RECOMMENDATION_LABELS[type]}
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-light-green-subtle/60 bg-white shadow-card">
                      {!isLoaded ? (
                        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 py-10">
                          <RhombusLoader size={44} />
                          <span className="text-sm text-light-green-dark-grey">Loading…</span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-stretch">
                          <div className="flex-1 p-4 sm:border-r sm:border-light-green-subtle/40">
                            {items.length > 0 ? (
                              <ul className="list-inside list-disc space-y-1 text-sm text-light-green-dark-grey">
                                {items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-light-green-light-grey">No recommendations for this category right now.</p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col justify-center border-t border-light-green-subtle/40 p-4 sm:border-t-0 sm:border-l sm:border-l-light-green-subtle/40">
                            <p className="mb-2 text-xs font-medium text-light-green-dark-grey">Last 7 days</p>
                            <VitalsLineChart labels={labels} series={series} dateKeys={last7.dateKeys} width={220} height={140} />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </main>

          {/* Right: healthy values reference */}
          <HealthyValuesPanel />
        </div>
      </div>
    </div>
  );
}
