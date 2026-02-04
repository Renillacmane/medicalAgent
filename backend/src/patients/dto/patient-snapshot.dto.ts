/**
 * Patient Snapshot DTO
 *
 * Normalized patient data produced by the patients module for agent/consumer use.
 * Used when building context for recommendations (e.g. LLM prompts).
 * Phase 1: profile + vitals only; later phases may add medications and exams.
 */

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface UserObjectives {
  body?: string[];
  health?: string[];
  mind?: string[];
}

export interface DietaryPreference {
  type?: string;
  restrictions?: string[];
}

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  isActive: boolean;
  height?: number; // cm
  weight?: number; // kg
  dietaryPreference?: DietaryPreference;
  objectives?: UserObjectives;
}

export interface PatientVital {
  id: string;
  date: Date;
  heartRate?: number; // bpm
  bloodPressure?: BloodPressure;
  weight?: number; // kg
  sleepHours?: number;
  stressPerception?: number; // 1-10
  bmi?: number;
  bloodOxygen?: number; // SpO2 %
  bloodGlucose?: number; // mg/dL or mmol/L
}

/**
 * Patient snapshot for agent flows.
 * Contains profile and recent vitals as returned by getPatientSnapshotForAgent().
 */
export interface PatientSnapshotDto {
  /** Patient profile (demographics, preferences, objectives) */
  profile: PatientProfile | null;

  /** Recent vitals (sorted by date descending) */
  vitals: PatientVital[];
}
