/**
 * Daily Recommendation DTO
 *
 * API response shape for GET /recommendations/daily.
 * The recommendations service parses LLM output into this structure.
 * All recommendation categories are non-critical wellness suggestions only.
 */

export interface RecommendationCategories {
  /** Nutrition suggestions (e.g., meal ideas, hydration reminders) */
  nutrition?: string[];

  /** Exercise suggestions (e.g., activity ideas, movement reminders) */
  exercise?: string[];

  /** Lifestyle suggestions (e.g., sleep hygiene, stress management) */
  lifestyle?: string[];

  /**
   * Non-critical health alerts.
   * IMPORTANT: These must NEVER contain:
   * - Diagnoses
   * - Emergency or critical medical advice
   * - Medication change suggestions
   *
   * Examples of valid alerts:
   * - "Consider tracking your sleep patterns"
   * - "Your recent stress levels have been elevated"
   * - "Remember to stay hydrated"
   */
  alerts?: string[];
}

export interface LittleThingRight {
  /** 1-2 small, actionable nudges based on frontier metric analysis */
  nudges: string[];
  /** The metric near a health boundary (e.g. "BMI", "Blood Pressure") */
  metric?: string;
  /** Whether the metric is improving, worsening, or stable */
  trend?: string;
}

export interface DailyRecommendationDto {
  /**
   * Brief summary of the day's recommendations.
   * Should be friendly, supportive, and non-alarmist.
   */
  summary: string;

  /**
   * Categorized recommendations.
   * All categories are optional; the LLM may omit categories
   * if not relevant to the patient's current data.
   */
  recommendations: RecommendationCategories;

  /**
   * Small actionable nudges when a vital is near a health-category boundary.
   * Omitted when no frontier metrics are detected.
   */
  littleThingRight?: LittleThingRight;

  /**
   * Timestamp when recommendations were generated
   */
  generatedAt: Date;
}

/**
 * Default/empty recommendation response
 */
export function createEmptyRecommendation(): DailyRecommendationDto {
  return {
    summary: 'No recommendations available at this time.',
    recommendations: {},
    generatedAt: new Date(),
  };
}

/**
 * Validate that a recommendation DTO has the expected structure
 */
export function isValidLittleThingRight(obj: unknown): obj is LittleThingRight {
  if (!obj || typeof obj !== 'object') return false;
  const ltr = obj as Record<string, unknown>;
  if (!Array.isArray(ltr.nudges)) return false;
  if (!ltr.nudges.every((n) => typeof n === 'string')) return false;
  if (ltr.metric !== undefined && typeof ltr.metric !== 'string') return false;
  if (ltr.trend !== undefined && typeof ltr.trend !== 'string') return false;
  return true;
}

export function isValidRecommendation(obj: unknown): obj is DailyRecommendationDto {
  if (!obj || typeof obj !== 'object') return false;
  const rec = obj as Record<string, unknown>;

  if (typeof rec.summary !== 'string') return false;
  if (!rec.recommendations || typeof rec.recommendations !== 'object') return false;

  const cats = rec.recommendations as Record<string, unknown>;
  const validCategories = ['nutrition', 'exercise', 'lifestyle', 'alerts'];

  for (const key of Object.keys(cats)) {
    if (!validCategories.includes(key)) continue;
    const value = cats[key];
    if (value !== undefined && !Array.isArray(value)) return false;
    if (Array.isArray(value) && !value.every((v) => typeof v === 'string')) {
      return false;
    }
  }

  if (rec.littleThingRight !== undefined && !isValidLittleThingRight(rec.littleThingRight)) {
    return false;
  }

  return true;
}
