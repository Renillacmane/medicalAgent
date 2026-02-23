/**
 * Health-limit boundary constants for vitals trend analysis.
 *
 * These define category thresholds used to detect when a patient's
 * metrics are near a boundary between health categories (e.g. BMI
 * transitioning from "overweight" to "normal").
 */

export interface HealthCategory {
  label: string;
  min: number;
  max: number;
}

export const BMI_CATEGORIES: HealthCategory[] = [
  { label: 'underweight', min: 0, max: 18.5 },
  { label: 'normal', min: 18.5, max: 25 },
  { label: 'overweight', min: 25, max: 30 },
  { label: 'obese', min: 30, max: Infinity },
];

export const BP_SYSTOLIC_CATEGORIES: HealthCategory[] = [
  { label: 'low', min: 0, max: 90 },
  { label: 'normal', min: 90, max: 120 },
  { label: 'elevated', min: 120, max: 130 },
  { label: 'high stage 1', min: 130, max: 140 },
  { label: 'high stage 2', min: 140, max: Infinity },
];

export const BP_DIASTOLIC_CATEGORIES: HealthCategory[] = [
  { label: 'low', min: 0, max: 60 },
  { label: 'normal', min: 60, max: 80 },
  { label: 'elevated', min: 80, max: 85 },
  { label: 'high stage 1', min: 85, max: 90 },
  { label: 'high stage 2', min: 90, max: Infinity },
];

export const HEART_RATE_CATEGORIES: HealthCategory[] = [
  { label: 'low', min: 0, max: 60 },
  { label: 'normal', min: 60, max: 100 },
  { label: 'elevated', min: 100, max: Infinity },
];

export const BLOOD_OXYGEN_CATEGORIES: HealthCategory[] = [
  { label: 'low', min: 0, max: 95 },
  { label: 'normal', min: 95, max: 101 },
];

/** Distance (in metric units) from a boundary to consider "near frontier" */
export const FRONTIER_THRESHOLD: Record<string, number> = {
  bmi: 1.5,
  weight: 2.0,
  systolic: 5,
  diastolic: 5,
  heartRate: 5,
  bloodOxygen: 2,
};

export function findCategory(value: number, categories: HealthCategory[]): HealthCategory | undefined {
  return categories.find((c) => value >= c.min && value < c.max);
}

export function distanceToBoundary(
  value: number,
  categories: HealthCategory[],
): { boundary: number; distance: number; lowerCategory: string; upperCategory: string } | null {
  for (let i = 0; i < categories.length - 1; i++) {
    const boundary = categories[i].max;
    const dist = Math.abs(value - boundary);
    if (dist <= (FRONTIER_THRESHOLD.bmi ?? 2)) {
      return {
        boundary,
        distance: dist,
        lowerCategory: categories[i].label,
        upperCategory: categories[i + 1].label,
      };
    }
  }
  return null;
}
