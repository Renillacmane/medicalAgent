"use client";

import { useState } from "react";
import type { PatientProfile } from "@/types/profile";
import type { Vital } from "@/types/vital";

/** WHO-style BMI categories (5) for body type illustration */
export type BMICategory = "underweight" | "normal" | "overweight" | "obese1" | "obese2";

const BMI_CATEGORIES: { key: BMICategory; label: string; min: number; max: number }[] = [
  { key: "underweight", label: "Underweight", min: 0, max: 18.49 },
  { key: "normal", label: "Normal", min: 18.5, max: 24.99 },
  { key: "overweight", label: "Overweight", min: 25, max: 29.99 },
  { key: "obese1", label: "Obese I", min: 30, max: 34.99 },
  { key: "obese2", label: "Obese II", min: 35, max: 999 },
];

function getBMICategory(bmi: number | null | undefined): BMICategory {
  if (bmi == null || !Number.isFinite(bmi)) return "normal";
  const c = BMI_CATEGORIES.find((cat) => bmi >= cat.min && bmi <= cat.max);
  return c?.key ?? "normal";
}

function ageFromDOB(dateOfBirth: string): number | null {
  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/** Simple full-body silhouette SVG – width scale suggests body type (placeholder style) */
function BodySilhouette({ category }: { category: BMICategory }) {
  const scale = { underweight: 0.72, normal: 0.88, overweight: 1, obese1: 1.12, obese2: 1.2 }[category];
  return (
    <div className="flex justify-center py-2">
      <svg
        viewBox="0 0 80 120"
        className="mx-auto h-32 w-20 text-light-green-dark/70"
        style={{ transform: `scaleX(${scale})` }}
        aria-hidden
      >
        <ellipse cx="40" cy="18" rx="14" ry="16" fill="currentColor" />
        <path
          d="M 40 34 L 40 58 Q 40 62 36 64 L 28 70 L 30 95 L 38 95 L 38 72 L 40 68 L 42 72 L 42 95 L 50 95 L 52 70 L 44 64 Q 40 62 40 58 Z"
          fill="currentColor"
        />
        <line x1="40" y1="42" x2="24" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="40" y1="42" x2="56" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export interface DailyVitals {
  vitalsByDay: (Vital | null)[];
  dateKeys: string[];
}

export interface UserPanelProps {
  profile: PatientProfile | null;
  vitals: Vital[];
  dailyVitals: DailyVitals;
}

export default function UserPanel({ profile, vitals, dailyVitals }: UserPanelProps) {
  const [mediaTab, setMediaTab] = useState<"photo" | "body">("photo");

  const { vitalsByDay } = dailyVitals;
  const latest = vitalsByDay.length > 0 ? vitalsByDay[vitalsByDay.length - 1] : null;

  const age = profile ? ageFromDOB(profile.dateOfBirth) : null;
  const height = profile?.height;
  const weight = latest?.weight ?? profile?.weight;
  const bmi = latest?.bmi ?? (height != null && weight != null ? weight / ((height / 100) ** 2) : null);
  const bmiCategory = getBMICategory(bmi);

  const heartRates = vitalsByDay
    .map((v) => v?.heartRate)
    .filter((n): n is number => typeof n === "number");
  const avgHeartRate =
    heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;

  const lastBloodPressure = latest?.bloodPressure;
  const bpStr =
    lastBloodPressure?.systolic != null && lastBloodPressure?.diastolic != null
      ? `${lastBloodPressure.systolic}/${lastBloodPressure.diastolic} mmHg`
      : null;

  const initials = profile
    ? [profile.firstName, profile.lastName]
        .map((s) => (s ?? "").trim()[0])
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"
    : "—";

  return (
    <aside className="w-full shrink-0 lg:w-52 xl:w-56">
      <div className="rounded-xl border border-light-green-subtle/60 bg-white shadow-card overflow-hidden">
        <div className="border-b border-light-green-subtle/40">
          <div className="flex">
            <button
              type="button"
              onClick={() => setMediaTab("photo")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                mediaTab === "photo"
                  ? "bg-light-green-subtle/30 text-light-green-dark border-b-2 border-light-green-primary"
                  : "text-light-green-dark-grey hover:bg-light-green-subtle/20"
              }`}
            >
              Photo
            </button>
            <button
              type="button"
              onClick={() => setMediaTab("body")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                mediaTab === "body"
                  ? "bg-light-green-subtle/30 text-light-green-dark border-b-2 border-light-green-primary"
                  : "text-light-green-dark-grey hover:bg-light-green-subtle/20"
              }`}
            >
              Body
            </button>
          </div>
          <div className="min-h-[140px] flex items-center justify-center p-3 bg-light-green-light/40">
            {mediaTab === "photo" ? (
              <div
                className="h-24 w-24 rounded-full bg-light-green-primary/20 flex items-center justify-center text-2xl font-semibold text-light-green-dark"
                aria-label="User avatar"
              >
                {initials}
              </div>
            ) : (
              <BodySilhouette category={bmiCategory} />
            )}
          </div>
          {mediaTab === "body" && (
            <p className="text-center text-xs text-light-green-dark-grey pb-2">
              {BMI_CATEGORIES.find((c) => c.key === bmiCategory)?.label ?? "Normal"}
            </p>
          )}
        </div>

        <dl className="divide-y divide-light-green-subtle/40 p-3 text-sm">
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">Age</dt>
            <dd className="font-medium text-light-green-dark">{age != null ? `${age} y` : "—"}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">Height</dt>
            <dd className="font-medium text-light-green-dark">{height != null ? `${height} cm` : "—"}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">Weight</dt>
            <dd className="font-medium text-light-green-dark">{weight != null ? `${weight} kg` : "—"}</dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">BMI</dt>
            <dd className="font-medium text-light-green-dark">
              {bmi != null ? bmi.toFixed(1) : "—"}
            </dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">Avg HR (7d)</dt>
            <dd className="font-medium text-light-green-dark">
              {avgHeartRate != null ? `${avgHeartRate} bpm` : "—"}
            </dd>
          </div>
          <div className="flex justify-between py-1.5">
            <dt className="text-light-green-dark-grey">Last BP</dt>
            <dd className="font-medium text-light-green-dark">{bpStr ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
