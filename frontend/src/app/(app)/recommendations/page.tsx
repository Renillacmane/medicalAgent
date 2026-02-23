"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getDailyVitals, VITALS_PERIOD_OPTIONS, type VitalsPeriodDays } from "@/lib/daily-vitals";
import { getProfile, getLatestVitalsByPeriod } from "@/services/patients.service";
import { getDailyRecommendations } from "@/services/recommendations.service";
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
import { TextHeading2, TextBody, InfoIcon } from "@/components/design";

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
  periodData: { vitalsByDay: (Vital | null)[]; dateKeys: string[] },
  type: RecommendationCategory,
): { labels: string[]; series: ChartSeries[] } {
  const keys = RECOMMENDATION_VITALS[type];
  const { vitalsByDay, dateKeys } = periodData;
  const fallbackLabels = Array.from({ length: dateKeys.length || 7 }, () => "—");
  const labels =
    dateKeys.length > 0
      ? dateKeys.map((k) => (k === "—" ? k : formatDate(k, "short")))
      : fallbackLabels;
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
  const [chartPeriod, setChartPeriod] = useState<VitalsPeriodDays>(7);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedTypes, setLoadedTypes] = useState<RecommendationCategory[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setError(null);
    setRecommendations(null);
    setProfile(null);
    setVitals([]);
    setLoadedTypes([]);
    setRetryCount((c) => c + 1);
  };

  // Initial load: recommendations and profile
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getDailyRecommendations().catch((e) => {
        if (e instanceof UnauthorizedError) return null;
        throw e;
      }),
      getProfile().catch((e) => {
        if (e instanceof UnauthorizedError) return null;
        return null;
      }),
    ])
      .then(([rec, prof]) => {
        if (cancelled) return;
        if (rec) setRecommendations(rec);
        if (prof) setProfile(prof);
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
  }, [router, basePath, retryCount]);

  // Fetch vitals for the selected period (runs on mount with 7 and when period changes)
  useEffect(() => {
    let cancelled = false;
    setVitalsLoading(true);
    getLatestVitalsByPeriod(chartPeriod)
      .then((vits) => {
        if (!cancelled) setVitals(Array.isArray(vits) ? vits : []);
      })
      .catch((e) => {
        if (!cancelled && !(e instanceof UnauthorizedError)) setVitals([]);
      })
      .finally(() => {
        if (!cancelled) setVitalsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chartPeriod, retryCount]);

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg bg-light-green-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-light-green-dark"
        >
          Retry
        </button>
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
            dailyVitals={getDailyVitals(vitals, chartPeriod)}
          />

          {/* Center: overall score + recommendations and graphs */}
          <main className="min-w-0 flex-1 space-y-6">
            {/* Top row: Overall score sections */}
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Left: Overall score */}
              <section
                className="flex-1 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card"
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

              {/* Right: Score graph */}
              <section className="flex shrink-0 flex-col rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card lg:w-64">
                <div className="mt-4 flex flex-1 flex-col">
                  <VitalsLineChart
                    labels={["—", "—", "—", "—", "—", "—", "—"]}
                    series={[
                      {
                        label: "",
                        values: [null, null, null, null, null, null, null],
                        color: "#0d9488",
                      },
                    ]}
                    width={220}
                    height={100}
                  />
                </div>
              </section>
            </div>

            {/* Bottom: The Little Thing Right card */}
            {/* 
              The Little Thing Right card - This will be informed by AI analysis in the future.
              Based on AI analysis, it will suggest little changes in categories that are close to changing,
              keeping the user motivated without extreme changes to their current lifestyle.
            */}
            <section className="rounded-lg border border-light-green-subtle/40 bg-light-green-light/30 p-6">
              <div className="mb-3 flex items-center gap-2">
                <InfoIcon iconSize="large" className="mb-0" />
                <TextHeading2 className="mb-0">The Little Thing Right</TextHeading2>
              </div>
              <TextBody>
                If you add 2 minutes to your walk and if you reduce the hidrocarbonates by 100 gms you might go down one weight category.
              </TextBody>
            </section>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-light-green-dark-grey">Vitals period:</span>
                {VITALS_PERIOD_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChartPeriod(p)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      chartPeriod === p
                        ? "bg-light-green-primary text-white"
                        : "bg-light-green-subtle/50 text-light-green-dark-grey hover:bg-light-green-subtle"
                    }`}
                  >
                    {p} days
                  </button>
                ))}
              </div>
              {RECOMMENDATION_TYPES.map((type) => {
                const isLoaded = loadedTypes.includes(type);
                const items = recommendations?.recommendations?.[type] ?? [];
                const periodData = getDailyVitals(vitals, chartPeriod);
                const { labels, series } = buildChartData(periodData, type);

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
                            <p className="mb-2 text-xs font-medium text-light-green-dark-grey">
                              Last {chartPeriod} days
                            </p>
                            {vitalsLoading ? (
                              <div className="flex h-[140px] w-[220px] items-center justify-center">
                                <RhombusLoader size={32} />
                              </div>
                            ) : (
                              <VitalsLineChart
                                labels={labels}
                                series={series}
                                dateKeys={periodData.dateKeys}
                                width={220}
                                height={140}
                              />
                            )}
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
