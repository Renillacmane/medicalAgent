"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authPost, UnauthorizedError } from "@/lib/api";
import { todayISO } from "@/lib/format";
import type { CreateVitalPayload } from "@/types/vital";

type Props = { onSuccess?: () => void; onBack?: () => void };

const INITIAL_DATE = todayISO();

export default function AddVitalsForm({ onSuccess, onBack }: Props) {
  const router = useRouter();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost("/patients/vitals", buildPayload());
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        router.replace("/login?redirect=/add");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save vital");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        <p className="font-medium">Vital recorded.</p>
        <p className="mt-1 text-sm">You can add another below or go back.</p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-3 text-sm font-medium text-green-700 underline"
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
          className="text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          ← Back to type
        </button>
      )}

      <div>
        <label htmlFor="vital-date" className="mb-1 block text-sm font-medium text-slate-700">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="vital-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-hr" className="mb-1 block text-sm font-medium text-slate-700">Heart rate (bpm)</label>
          <input
            id="vital-hr"
            type="number"
            min={0}
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="vital-weight" className="mb-1 block text-sm font-medium text-slate-700">Weight (kg)</label>
          <input
            id="vital-weight"
            type="number"
            min={0}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-systolic" className="mb-1 block text-sm font-medium text-slate-700">Blood pressure (systolic)</label>
          <input
            id="vital-systolic"
            type="number"
            min={0}
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="vital-diastolic" className="mb-1 block text-sm font-medium text-slate-700">Diastolic</label>
          <input
            id="vital-diastolic"
            type="number"
            min={0}
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-height" className="mb-1 block text-sm font-medium text-slate-700">Height (cm)</label>
          <input
            id="vital-height"
            type="number"
            min={0}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="vital-sleep" className="mb-1 block text-sm font-medium text-slate-700">Sleep (hours)</label>
          <input
            id="vital-sleep"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="vital-stress" className="mb-1 block text-sm font-medium text-slate-700">Stress (1–10)</label>
          <input
            id="vital-stress"
            type="number"
            min={1}
            max={10}
            value={stressPerception}
            onChange={(e) => setStressPerception(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label htmlFor="vital-spo2" className="mb-1 block text-sm font-medium text-slate-700">SpO₂ (%)</label>
          <input
            id="vital-spo2"
            type="number"
            min={0}
            max={100}
            value={bloodOxygen}
            onChange={(e) => setBloodOxygen(e.target.value)}
            placeholder="—"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="vital-glucose" className="mb-1 block text-sm font-medium text-slate-700">Blood glucose</label>
        <input
          id="vital-glucose"
          type="number"
          min={0}
          value={bloodGlucose}
          onChange={(e) => setBloodGlucose(e.target.value)}
          placeholder="—"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save vital"}
      </button>
    </form>
  );
}
