"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { createVital } from "@/services/patients.service";
import { todayISO } from "@/lib/format";
import { addPendingVital } from "@/lib/pwa/offline-store";
import { syncPendingVitals, requestBackgroundSync } from "@/lib/pwa/sync-manager";
import type { CreateVitalPayload } from "@/types/vital";

type Props = { onSuccess?: () => void; onBack?: () => void };

const INITIAL_DATE = todayISO();

const inputClass =
  "mt-1 block w-full rounded-lg border border-light-green-subtle/80 bg-white px-3 py-2 text-light-green-dark shadow-sm transition-colors focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30";

export default function AddVitalsForm({ onSuccess, onBack }: Props) {
  const router = useRouter();
  const basePath = useBasePath();
  const [date, setDate] = useState(INITIAL_DATE);
  const [heartRate, setHeartRate] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [stressPerception, setStressPerception] = useState("");
  const [bloodOxygen, setBloodOxygen] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [queued, setQueued] = useState(false);

  // On mount, attempt to drain any pending offline vitals
  useEffect(() => {
    if (navigator.onLine) {
      syncPendingVitals().catch(() => {});
    }
  }, []);

  function buildPayload(): CreateVitalPayload {
    const payload: CreateVitalPayload = { date };
    const hr = Number(heartRate);
    if (!Number.isNaN(hr) && hr > 0) payload.heartRate = hr;
    const sys = Number(systolic);
    const dia = Number(diastolic);
    if (!Number.isNaN(sys) && !Number.isNaN(dia))
      payload.bloodPressure = { systolic: sys, diastolic: dia };
    const w = Number(weight);
    if (!Number.isNaN(w) && w > 0) payload.weight = w;
    const h = Number(height);
    if (!Number.isNaN(h) && h > 0) payload.height = h;
    const sleep = Number(sleepHours);
    if (!Number.isNaN(sleep) && sleep >= 0) payload.sleepHours = sleep;
    const stress = Number(stressPerception);
    if (!Number.isNaN(stress) && stress >= 1 && stress <= 10)
      payload.stressPerception = stress;
    const spo2 = Number(bloodOxygen);
    if (!Number.isNaN(spo2) && spo2 >= 0) payload.bloodOxygen = spo2;
    const glu = Number(bloodGlucose);
    if (!Number.isNaN(glu) && glu >= 0) payload.bloodGlucose = glu;
    return payload;
  }

  function resetForm() {
    setSuccess(false);
    setQueued(false);
    setDate(todayISO());
    setHeartRate("");
    setSystolic("");
    setDiastolic("");
    setWeight("");
    setHeight("");
    setSleepHours("");
    setStressPerception("");
    setBloodOxygen("");
    setBloodGlucose("");
  }

  // TODO - Review this function
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setQueued(false);
    setLoading(true);

    const payload = buildPayload();

    // If offline, queue immediately
    if (!navigator.onLine) {
      try {
        await addPendingVital(payload);
        await requestBackgroundSync();
        setQueued(true);
        setSuccess(true);
        onSuccess?.();
      } catch {
        setError("Failed to save vital for offline sync.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Online – try the API
    try {
      await createVital(payload);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/add")}`);
        return;
      }
      // Network error while "online" (flaky connection) – queue offline
      try {
        await addPendingVital(payload);
        await requestBackgroundSync();
        setQueued(true);
        setSuccess(true);
        onSuccess?.();
      } catch {
        setError(err instanceof Error ? err.message : "Failed to save vital");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className={`rounded-lg border p-4 ${
          queued
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-light-green-subtle bg-light-green-light/50 text-light-green-primary-dark"
        }`}
      >
        <p className="font-medium">
          {queued ? "Vital saved offline." : "Vital recorded."}
        </p>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          {queued
            ? "It will be synced automatically when you're back online."
            : "You can add another below or go back."}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-3 text-sm font-medium text-light-green-primary underline-offset-2 hover:underline"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-light-green-primary underline-offset-2 transition-colors hover:underline hover:text-light-green-primary-dark"
        >
          ← Back to type
        </button>
      )}

      <div>
        <label htmlFor="vital-date" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="vital-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-hr" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Heart rate (bpm)</label>
          <input
            id="vital-hr"
            type="number"
            min={0}
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vital-weight" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Weight (kg)</label>
          <input
            id="vital-weight"
            type="number"
            min={0}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-systolic" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Blood pressure (systolic)</label>
          <input
            id="vital-systolic"
            type="number"
            min={0}
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vital-diastolic" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Diastolic</label>
          <input
            id="vital-diastolic"
            type="number"
            min={0}
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-height" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Height (cm)</label>
          <input
            id="vital-height"
            type="number"
            min={0}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vital-sleep" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Sleep (hours)</label>
          <input
            id="vital-sleep"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-stress" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Stress (1–10)</label>
          <input
            id="vital-stress"
            type="number"
            min={1}
            max={10}
            value={stressPerception}
            onChange={(e) => setStressPerception(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vital-spo2" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">SpO₂ (%)</label>
          <input
            id="vital-spo2"
            type="number"
            min={0}
            max={100}
            value={bloodOxygen}
            onChange={(e) => setBloodOxygen(e.target.value)}
            placeholder="—"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="vital-glucose" className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Blood glucose</label>
        <input
          id="vital-glucose"
          type="number"
          min={0}
          value={bloodGlucose}
          onChange={(e) => setBloodGlucose(e.target.value)}
          placeholder="—"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark hover:shadow-card-hover active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? "Saving…" : "Save vital"}
      </button>
    </form>
  );
}
