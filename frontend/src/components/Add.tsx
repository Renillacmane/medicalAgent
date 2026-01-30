"use client";

import { useState } from "react";
import AddVitalsForm from "./add/AddVitalsForm";

type AddType = "vitals" | "prescriptions" | "exams" | null;

function VitalsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function PrescriptionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function ExamsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

const ADD_OPTIONS: { id: AddType; label: string; icon: "vitals" | "prescriptions" | "exams"; available: boolean }[] = [
  { id: "vitals", label: "Vitals", icon: "vitals", available: true },
  { id: "prescriptions", label: "Prescriptions", icon: "prescriptions", available: false },
  { id: "exams", label: "Exams", icon: "exams", available: false },
];

export default function Add() {
  const [selected, setSelected] = useState<AddType>(null);

  if (selected === "vitals") {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-slate-800">Add Vitals</h1>
        <p className="mt-1 text-sm text-slate-500">Record a vital reading. Date is required; other fields are optional.</p>
        <div className="mt-4">
          <AddVitalsForm onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-slate-800 font-medium">Add</p>
      <p className="mt-1 text-sm text-slate-500">Choose what type of data to add.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ADD_OPTIONS.map((opt) => {
          const available = opt.available;
          const Icon =
            opt.icon === "vitals" ? VitalsIcon : opt.icon === "prescriptions" ? PrescriptionsIcon : ExamsIcon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => available && opt.id && setSelected(opt.id)}
              disabled={!available}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                available
                  ? "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
              }`}
            >
              <span className={available ? "text-slate-700" : "text-slate-400"}>
                <Icon className="h-10 w-10" />
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
              {!available && <span className="text-xs text-slate-400">Coming soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
