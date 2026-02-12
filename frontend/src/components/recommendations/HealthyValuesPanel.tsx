"use client";

/**
 * Reference panel showing healthy / normal ranges for common vitals.
 * Shown on the right side of the recommendations page.
 */

const HEALTHY_VITALS: { name: string; range: string; unit?: string; notes?: string }[] = [
  { name: "Heart rate", range: "60–100", unit: "bpm", notes: "Resting, adults" },
  { name: "Blood pressure", range: "<120/80", unit: "mmHg", notes: "Normal; 120–129/80 = elevated" },
  { name: "SpO₂", range: "95–100", unit: "%", notes: "At sea level" },
  { name: "BMI", range: "18.5–24.9", unit: "", notes: "Adults (WHO)" },
  { name: "Sleep", range: "7–9", unit: "h/night", notes: "Adults" },
  { name: "Blood glucose (fasting)", range: "70–100", unit: "mg/dL", notes: "Or 3.9–5.6 mmol/L" },
  { name: "Stress (perception)", range: "1–4", unit: " (1–10 scale)", notes: "Lower is better" },
];

export default function HealthyValuesPanel() {
  return (
    <aside className="w-full shrink-0 lg:w-52 xl:w-56">
      <div className="rounded-xl border border-light-green-subtle/60 bg-white p-4 shadow-card">
        <h3 className="text-sm font-semibold text-light-green-dark">Healthy reference values</h3>
        <p className="mt-1 text-xs text-light-green-dark-grey">
          General ranges; your targets may vary with your doctor.
        </p>
        <ul className="mt-4 space-y-3">
          {HEALTHY_VITALS.map((v) => (
            <li key={v.name} className="border-b border-light-green-subtle/30 pb-2 last:border-0 last:pb-0">
              <div className="text-xs font-medium text-light-green-dark">{v.name}</div>
              <div className="text-sm text-light-green-primary font-medium">
                {v.range}
                {v.unit ? ` ${v.unit}` : ""}
              </div>
              {v.notes && (
                <div className="text-[10px] text-light-green-light-grey mt-0.5">{v.notes}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
