import { authGet, authPatch, authPost, authDelete, authPostFormData } from "@/lib/api";
import type { PatientProfile, NotificationSettings } from "@/types/profile";
import type { Vital, CreateVitalPayload } from "@/types/vital";
import type {
  Exam,
  UserHealthDocument,
  Medication,
  CreateMedicationPayload,
  UpdateMedicationPayload,
  BatchCreateMedicationsPayload,
  BatchCreateMedicationsResponse,
  PrescriptionExtractedData,
} from "@/types/health";

export type VitalsPeriodDays = 7 | 15 | 30;

/** GET /patients/profile */
export async function getProfile(): Promise<PatientProfile> {
  return authGet<PatientProfile>("/patients/profile");
}

/** PATCH /patients/profile */
export async function updateProfile(payload: Record<string, unknown>): Promise<PatientProfile> {
  return authPatch<PatientProfile>("/patients/profile", payload);
}

/** GET /patients/vitals (optional limit and days) */
export async function getVitals(options?: {
  limit?: number;
  days?: number;
}): Promise<Vital[]> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set("limit", String(options.limit));
  if (options?.days != null) params.set("days", String(options.days));
  const query = params.toString();
  return authGet<Vital[]>(`/patients/vitals${query ? `?${query}` : ""}`);
}

/** GET /patients/vitals/latest-by-period?period=7|15|30 */
export async function getLatestVitalsByPeriod(period: VitalsPeriodDays): Promise<Vital[]> {
  return authGet<Vital[]>(`/patients/vitals/latest-by-period?period=${period}`);
}

/** POST /patients/vitals */
export async function createVital(payload: CreateVitalPayload): Promise<Vital> {
  return authPost<Vital>("/patients/vitals", payload);
}

/** GET /patients/exams */
export async function getExams(): Promise<Exam[]> {
  return authGet<Exam[]>("/patients/exams");
}

/** GET /patients/documents (optional documentType filter) */
export async function getDocuments(documentType?: string): Promise<UserHealthDocument[]> {
  const query = documentType ? `?documentType=${encodeURIComponent(documentType)}` : "";
  return authGet<UserHealthDocument[]>(`/patients/documents${query}`);
}

/** GET /patients/documents/:id — single document (e.g. for original prescription text). Returns null if not found. */
export async function getDocument(id: string): Promise<UserHealthDocument | null> {
  try {
    return await authGet<UserHealthDocument>(`/patients/documents/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

/** POST /patients/documents/upload (multipart FormData) */
export async function uploadDocument(formData: FormData): Promise<{
  id: string;
  status: string;
  message: string;
  extractedData?: PrescriptionExtractedData;
}> {
  return authPostFormData("/patients/documents/upload", formData);
}

/** GET /patients/medications */
export async function getMedications(): Promise<Medication[]> {
  return authGet<Medication[]>("/patients/medications");
}

/** POST /patients/medications */
export async function createMedication(payload: CreateMedicationPayload): Promise<Medication> {
  return authPost<Medication>("/patients/medications", payload);
}

/** PATCH /patients/medications/:id */
export async function updateMedication(id: string, payload: UpdateMedicationPayload): Promise<Medication> {
  return authPatch<Medication>(`/patients/medications/${id}`, payload);
}

/** DELETE /patients/medications/:id */
export async function deleteMedication(id: string): Promise<{ success: boolean }> {
  return authDelete<{ success: boolean }>(`/patients/medications/${id}`);
}

/** POST /patients/medications/batch */
export async function batchCreateMedications(payload: BatchCreateMedicationsPayload): Promise<BatchCreateMedicationsResponse> {
  return authPost<BatchCreateMedicationsResponse>("/patients/medications/batch", payload);
}

export type SettingsResponse = { notificationSettings: NotificationSettings };

/** GET /patients/settings */
export async function getSettings(): Promise<SettingsResponse> {
  return authGet<SettingsResponse>("/patients/settings");
}

/** PATCH /patients/settings */
export async function updateSettings(payload: { notificationSettings?: Partial<NotificationSettings> }): Promise<SettingsResponse> {
  return authPatch<SettingsResponse>("/patients/settings", payload);
}
