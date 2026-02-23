/** Recommendation categories from GET /recommendations/daily */
export type RecommendationCategory = "nutrition" | "exercise" | "lifestyle" | "alerts";

export interface LittleThingRight {
  nudges: string[];
  metric?: string;
  trend?: string;
}

export interface DailyRecommendationResponse {
  summary: string;
  recommendations: {
    nutrition?: string[];
    exercise?: string[];
    lifestyle?: string[];
    alerts?: string[];
  };
  littleThingRight?: LittleThingRight;
  generatedAt: string;
}

/** Vital key used in charts (must match Vital type fields) */
export type VitalChartKey = "heartRate" | "weight" | "bmi" | "sleepHours" | "stressPerception" | "bloodOxygen" | "bloodGlucose" | "bloodPressureSystolic";

/** One series for the line chart (label + values per day) */
export interface ChartSeries {
  label: string;
  values: (number | null)[];
  color?: string;
}

/** Which vitals to show per recommendation type (3 per type) */
export const RECOMMENDATION_VITALS: Record<RecommendationCategory, [VitalChartKey, VitalChartKey, VitalChartKey]> = {
  nutrition: ["weight", "bloodGlucose", "bmi"],
  exercise: ["heartRate", "bloodOxygen", "weight"],
  lifestyle: ["sleepHours", "stressPerception", "heartRate"],
  alerts: ["heartRate", "bloodOxygen", "stressPerception"],
};

export const RECOMMENDATION_LABELS: Record<RecommendationCategory, string> = {
  nutrition: "Nutrition",
  exercise: "Exercise",
  lifestyle: "Lifestyle",
  alerts: "Alerts",
};
