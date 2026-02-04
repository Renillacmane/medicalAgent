"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authGet, UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Vital } from "@/types/vital";
import type {
  DailyRecommendationResponse,
  RecommendationCategory,
  VitalChartKey,
} from "@/types/recommendations";
import { RECOMMENDATION_VITALS, RECOMMENDATION_LABELS, type ChartSeries } from "@/types/recommendations";
import RhombusLoader from "@/components/ui/RhombusLoader";
import VitalsLineChart from "@/components/recommendations/VitalsLineChart";

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
  vitals: Vital[],
  type: RecommendationCategory,
): { labels: string[]; series: ChartSeries[] } {
  const keys = RECOMMENDATION_VITALS[type];
  const sorted = [...vitals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const last7 = sorted.slice(-7);
  const labels =
    last7.length > 0
      ? last7.map((v) => formatDate(v.date, "short"))
      : ["—", "—", "—", "—", "—", "—", "—"];
  const series: ChartSeries[] = keys.map((key) => ({
    label: VITAL_LABELS[key],
    values:
      last7.length > 0
        ? last7.map((v) => getVitalValue(v, key))
        : [null, null, null, null, null, null, null],
  }));
  return { labels, series };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<DailyRecommendationResponse | null>(null);
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
      authGet<Vital[]>("/patients/vitals?days=7&limit=20").catch((e) => {
        if (e instanceof UnauthorizedError) return [];
        return [] as Vital[];
      }),
    ])
      .then(([rec, vits]) => {
        if (cancelled) return;
        if (rec) setRecommendations(rec);
        if (Array.isArray(vits)) setVitals(vits);
        // Reveal each card by type with a short delay for staggered animation
        RECOMMENDATION_TYPES.forEach((type, i) => {
          setTimeout(() => {
            if (!cancelled) setLoadedTypes((prev) => [...prev, type]);
          }, i * 280);
        });
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace("/login?redirect=/recommendations");
            return;
          }
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green-light pb-20">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-xl font-semibold text-light-green-dark">Recommendations</h1>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          Personalized by type with related vitals from the last 7 days.
        </p>

        {/* Overall score placeholder – algorithm to be researched.
            Possible approaches (for later):
            - Weighted composite: adherence to recommendations + vital trend scores (e.g. improving vs declining).
            - Normalized sub-scores per category (nutrition, exercise, lifestyle) then average or weighted mean.
            - Risk/wellness score from literature (e.g. simple heuristic from sleep + stress + heart rate bands).
            - ML model trained on outcomes if we have historical adherence + outcomes data. */}
        <section
          className="mt-6 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card"
          aria-label="Overall score placeholder"
        >
          <h2 className="text-sm font-medium text-light-green-dark-grey">Overall score</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-light-green-primary">—</span>
            <span className="text-sm text-light-green-light-grey">(coming soon)</span>
          </div>
          <p className="mt-2 text-xs text-light-green-light-grey">
            A single wellness score will be added here once we choose an appropriate algorithm (e.g. weighted composite of adherence and vital trends).
          </p>
        </section>

        <div className="mt-8 space-y-6">
          {RECOMMENDATION_TYPES.map((type) => {
            const isLoaded = loadedTypes.includes(type);
            const items = recommendations?.recommendations?.[type] ?? [];
            const { labels, series } = buildChartData(vitals, type);

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
                        <VitalsLineChart labels={labels} series={series} width={220} height={120} />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
