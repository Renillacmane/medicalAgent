import { authGet, authPatch, authPost, authPostFormData } from "@/lib/api";
import type { PatientProfile } from "@/types/profile";
import type { Vital, CreateVitalPayload } from "@/types/vital";
import type { Exam, UserHealthDocument } from "@/types/health";

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

/** POST /patients/documents/upload (multipart FormData) */
export async function uploadDocument(formData: FormData): Promise<{
  id: string;
  status: string;
  message: string;
}> {
  return authPostFormData("/patients/documents/upload", formData);
}
