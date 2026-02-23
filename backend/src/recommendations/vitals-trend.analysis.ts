/**
 * Vitals Trend Analysis
 *
 * Analyzes recent vitals to detect metrics approaching health-category
 * boundaries. Used by "The Little Thing Right" to generate small,
 * actionable nudges when a patient is close to crossing into a
 * better (or worse) health category.
 */

import type { PatientVital } from '../patients/dto/patient-snapshot.dto';
import {
  BMI_CATEGORIES,
  BP_SYSTOLIC_CATEGORIES,
  HEART_RATE_CATEGORIES,
  BLOOD_OXYGEN_CATEGORIES,
  FRONTIER_THRESHOLD,
  findCategory,
  type HealthCategory,
} from '../common/utils/health-boundaries';

export interface FrontierMetric {
  metric: string;
  currentValue: number;
  currentCategory: string;
  nearestBoundary: number;
  targetCategory: string;
  trend: 'improving' | 'worsening' | 'stable';
  distanceToBoundary: number;
}

export interface TrendAnalysisResult {
  frontierMetrics: FrontierMetric[];
  hasData: boolean;
}

/**
 * Given a series of values (newest first), compute a simple linear trend.
 * Returns a negative slope if values are decreasing over time.
 */
function computeTrendSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

type TrendDirection = 'improving' | 'worsening' | 'stable';

/**
 * Determine whether a metric is improving, worsening, or stable based on slope.
 * "Improving" means moving toward a healthier category.
 */
function classifyTrend(slope: number, metricType: 'lower-is-better' | 'higher-is-better'): TrendDirection {
  const threshold = 0.01;
  if (Math.abs(slope) < threshold) return 'stable';
  if (metricType === 'lower-is-better') {
    return slope < 0 ? 'improving' : 'worsening';
  }
  return slope > 0 ? 'improving' : 'worsening';
}

function analyzeSingleMetric(
  metricName: string,
  values: number[],
  categories: HealthCategory[],
  frontierThreshold: number,
  betterDirection: 'lower-is-better' | 'higher-is-better',
): FrontierMetric | null {
  if (values.length === 0) return null;

  const current = values[0];
  const currentCat = findCategory(current, categories);
  if (!currentCat) return null;

  for (let i = 0; i < categories.length - 1; i++) {
    const boundary = categories[i].max;
    const dist = Math.abs(current - boundary);
    if (dist > frontierThreshold) continue;

    const isAboveBoundary = current >= boundary;
    const lowerCat = categories[i];
    const upperCat = categories[i + 1];
    const targetCat = isAboveBoundary ? lowerCat : upperCat;

    const slope = computeTrendSlope(values);
    const trend = classifyTrend(slope, betterDirection);

    return {
      metric: metricName,
      currentValue: Math.round(current * 10) / 10,
      currentCategory: currentCat.label,
      nearestBoundary: boundary,
      targetCategory: targetCat.label,
      trend,
      distanceToBoundary: Math.round(dist * 10) / 10,
    };
  }

  return null;
}

/**
 * Analyze recent vitals and return metrics that are near a health-category boundary.
 * Vitals should be sorted newest-first (most recent at index 0).
 */
export function analyzeVitalsTrends(vitals: PatientVital[]): TrendAnalysisResult {
  if (!vitals || vitals.length === 0) {
    return { frontierMetrics: [], hasData: false };
  }

  const frontierMetrics: FrontierMetric[] = [];

  const bmiValues = vitals.map((v) => v.bmi).filter((v): v is number => v != null);
  const bmiResult = analyzeSingleMetric('BMI', bmiValues, BMI_CATEGORIES, FRONTIER_THRESHOLD.bmi, 'lower-is-better');
  if (bmiResult) frontierMetrics.push(bmiResult);

  const systolicValues = vitals.map((v) => v.bloodPressure?.systolic).filter((v): v is number => v != null);
  const systolicResult = analyzeSingleMetric(
    'Blood Pressure (systolic)',
    systolicValues,
    BP_SYSTOLIC_CATEGORIES,
    FRONTIER_THRESHOLD.systolic,
    'lower-is-better',
  );
  if (systolicResult) frontierMetrics.push(systolicResult);

  const hrValues = vitals.map((v) => v.heartRate).filter((v): v is number => v != null);
  const hrResult = analyzeSingleMetric(
    'Heart Rate',
    hrValues,
    HEART_RATE_CATEGORIES,
    FRONTIER_THRESHOLD.heartRate,
    'lower-is-better',
  );
  if (hrResult) frontierMetrics.push(hrResult);

  const spo2Values = vitals.map((v) => v.bloodOxygen).filter((v): v is number => v != null);
  const spo2Result = analyzeSingleMetric(
    'Blood Oxygen',
    spo2Values,
    BLOOD_OXYGEN_CATEGORIES,
    FRONTIER_THRESHOLD.bloodOxygen,
    'higher-is-better',
  );
  if (spo2Result) frontierMetrics.push(spo2Result);

  const weightValues = vitals.map((v) => v.weight).filter((v): v is number => v != null);
  if (weightValues.length >= 2 && bmiValues.length > 0) {
    const slope = computeTrendSlope(weightValues);
    const trend = classifyTrend(slope, 'lower-is-better');
    if (bmiResult && trend !== 'stable') {
      bmiResult.trend = trend;
    }
  }

  return { frontierMetrics, hasData: true };
}

/**
 * Format frontier metrics as text for LLM context injection.
 */
export function formatFrontierMetricsForPrompt(result: TrendAnalysisResult): string {
  if (!result.hasData || result.frontierMetrics.length === 0) {
    return '';
  }

  const lines = ['VITALS NEAR HEALTH-CATEGORY BOUNDARIES:'];
  for (const m of result.frontierMetrics) {
    lines.push(
      `- ${m.metric}: currently ${m.currentValue} (${m.currentCategory}), ` +
        `${m.distanceToBoundary} units from the "${m.nearestBoundary}" boundary ` +
        `(next category: ${m.targetCategory}), trend: ${m.trend}`,
    );
  }
  return lines.join('\n');
}
