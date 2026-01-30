/**
 * Vital-specific formatters (blood pressure, etc.).
 * Kept separate from generic format.ts so Dashboard/vitals can import without pulling date styles.
 */

import type { BloodPressure } from "@/types/vital";

export function formatBP(bp?: BloodPressure): string {
  if (!bp || (bp.systolic == null && bp.diastolic == null)) return "—";
  return `${bp.systolic ?? "—"}/${bp.diastolic ?? "—"}`;
}
