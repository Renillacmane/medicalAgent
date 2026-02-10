"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/config";
import { persistAuthToken, persistApiUrl } from "@/lib/pwa/offline-store";
import { authPatch } from "@/lib/api";
import type { PatientProfile } from "@/types/profile";

const STEPS = [
  { id: "account", title: "Account", description: "Email and password" },
  { id: "physical", title: "Physical", description: "Height & weight" },
  { id: "diet", title: "Diet", description: "Dietary preferences" },
  { id: "objectives", title: "Objectives", description: "Your goals" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export type RegisterFormData = {
  // Step 1 – account
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  // Step 2 – physical
  height: string;
  weight: string;
  // Step 3 – diet
  dietaryType: string;
  dietaryRestrictions: string;
  // Step 4 – objectives
  objectivesBody: string;
  objectivesHealth: string;
  objectivesMind: string;
};

const initialForm: RegisterFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  password: "",
  height: "",
  weight: "",
  dietaryType: "",
  dietaryRestrictions: "",
  objectivesBody: "",
  objectivesHealth: "",
  objectivesMind: "",
};

type Props = { onSuccess?: () => void };

const inputClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

export default function RegisterForm({ onSuccess }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<RegisterFormData>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const update = (updates: Partial<RegisterFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const goNext = () => {
    setError(null);
    if (isLast) {
      handleSubmit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  function buildProfilePayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const height = form.height.trim() ? Number(form.height) : NaN;
    const weight = form.weight.trim() ? Number(form.weight) : NaN;
    if (!Number.isNaN(height)) payload.height = height;
    if (!Number.isNaN(weight)) payload.weight = weight;

    const restrictions = form.dietaryRestrictions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (form.dietaryType.trim() || restrictions.length > 0) {
      payload.dietaryPreference = {
        type: form.dietaryType.trim() || undefined,
        restrictions,
      };
    }

    const body = form.objectivesBody.split(",").map((s) => s.trim()).filter(Boolean);
    const health = form.objectivesHealth.split(",").map((s) => s.trim()).filter(Boolean);
    const mind = form.objectivesMind.split(",").map((s) => s.trim()).filter(Boolean);
    payload.objectives = { body, health, mind };

    return payload;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { message?: string }).message ?? "Registration failed");
        return;
      }
      const token = (data as { access_token?: string }).access_token;
      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
        }
        persistAuthToken(token).catch(() => {});
        persistApiUrl(apiUrl).catch(() => {});
      }

      const profilePayload = buildProfilePayload();
      const hasProfileData = Object.keys(profilePayload).length > 0;
      if (hasProfileData) {
        await authPatch<PatientProfile>("/patients/profile", profilePayload);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <nav aria-label="Registration steps" className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => setStepIndex(i)}
              className={`flex min-w-0 flex-1 flex-col rounded-md px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                i === stepIndex
                  ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate text-xs font-medium">{s.title}</span>
              <span className="truncate text-[10px] text-slate-500">{s.description}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="text-slate-300" aria-hidden>
                ›
              </span>
            )}
          </div>
        ))}
      </nav>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        className="space-y-4"
      >
        {currentStep.id === "account" && (
          <>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                First name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                className={inputClass}
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                className={inputClass}
                placeholder="Last name"
                required
                autoComplete="family-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Date of birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })}
                className={inputClass}
                required
                autoComplete="bday"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                className={inputClass}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update({ password: e.target.value })}
                className={inputClass}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        {currentStep.id === "physical" && (
          <>
            <p className="text-sm text-slate-600">
              Optional. This helps us tailor recommendations (e.g. BMI, activity).
            </p>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Height (cm)
              </label>
              <input
                type="number"
                min={50}
                max={250}
                value={form.height}
                onChange={(e) => update({ height: e.target.value })}
                className={inputClass}
                placeholder="e.g. 170"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Weight (kg)
              </label>
              <input
                type="number"
                min={20}
                max={300}
                value={form.weight}
                onChange={(e) => update({ weight: e.target.value })}
                className={inputClass}
                placeholder="e.g. 70"
              />
            </div>
          </>
        )}

        {currentStep.id === "diet" && (
          <>
            <p className="text-sm text-slate-600">
              Optional. Used for nutrition suggestions.
            </p>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Dietary type
              </label>
              <input
                type="text"
                value={form.dietaryType}
                onChange={(e) => update({ dietaryType: e.target.value })}
                className={inputClass}
                placeholder="e.g. Vegetarian, Vegan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Dietary restrictions (comma-separated)
              </label>
              <input
                type="text"
                value={form.dietaryRestrictions}
                onChange={(e) => update({ dietaryRestrictions: e.target.value })}
                className={inputClass}
                placeholder="e.g. gluten-free, dairy-free"
              />
            </div>
          </>
        )}

        {currentStep.id === "objectives" && (
          <>
            <p className="text-sm text-slate-600">
              Optional. What do you want to focus on? Comma-separated for each.
            </p>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Body goals
              </label>
              <input
                type="text"
                value={form.objectivesBody}
                onChange={(e) => update({ objectivesBody: e.target.value })}
                className={inputClass}
                placeholder="e.g. lose weight, build muscle"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Health goals
              </label>
              <input
                type="text"
                value={form.objectivesHealth}
                onChange={(e) => update({ objectivesHealth: e.target.value })}
                className={inputClass}
                placeholder="e.g. lower blood pressure"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Mind / wellness goals
              </label>
              <input
                type="text"
                value={form.objectivesMind}
                onChange={(e) => update({ objectivesMind: e.target.value })}
                className={inputClass}
                placeholder="e.g. reduce stress, sleep better"
              />
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {!isFirst && (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading
              ? "Creating account…"
              : isLast
                ? "Complete registration"
                : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
