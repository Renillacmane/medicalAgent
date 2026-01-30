/** Blood pressure (API response: optional fields) */
export type BloodPressure = { systolic?: number; diastolic?: number };

/** Vital record from GET /patients/vitals */
export type Vital = {
  id?: string;
  date: string;
  heartRate?: number;
  bloodPressure?: BloodPressure;
  weight?: number;
  bmi?: number;
  sleepHours?: number;
  stressPerception?: number;
  bloodOxygen?: number;
  bloodGlucose?: number;
  createdAt?: string;
};

/** Blood pressure for create payload (both required when present) */
export type BloodPressureInput = { systolic: number; diastolic: number };

/** Payload for POST /patients/vitals */
export type CreateVitalPayload = {
  date: string;
  heartRate?: number;
  bloodPressure?: BloodPressureInput;
  weight?: number;
  height?: number;
  sleepHours?: number;
  stressPerception?: number;
  bloodOxygen?: number;
  bloodGlucose?: number;
};
