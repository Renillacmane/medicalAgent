/** Exam from GET /patients/exams */
export interface Exam {
  id: string;
  name: string;
  date: string;
  attachmentId?: string;
}

/** User document (e.g. prescription) from GET /patients/documents */
export interface UserHealthDocument {
  id: string;
  documentType: string;
  originalFilename: string;
  attachmentId: string;
  extractedData: Record<string, unknown>;
  analysisSummary: string;
  documentDate?: string;
  processedAt: string;
  status: string;
}

/** Medication record from GET /patients/medications */
export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  timesPerDay?: number;
  reminderTimes?: string[];
  activeSubstance?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string | null;
  isActive: boolean;
  sourceDocumentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload for POST /patients/medications */
export interface CreateMedicationPayload {
  name: string;
  dosage?: string;
  frequency?: string;
  timesPerDay?: number;
  reminderTimes?: string[];
  activeSubstance?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  sourceDocumentId?: string;
}

/** Payload for PATCH /patients/medications/:id */
export interface UpdateMedicationPayload {
  name?: string;
  dosage?: string;
  frequency?: string;
  timesPerDay?: number;
  reminderTimes?: string[];
  activeSubstance?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/** Single item in batch medications request */
export interface BatchMedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
  timesPerDay?: number;
  reminderTimes?: string[];
  activeSubstance?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/** Payload for POST /patients/medications/batch */
export interface BatchCreateMedicationsPayload {
  sourceDocumentId?: string;
  medications: BatchMedicationItem[];
}

/** Response from POST /patients/medications/batch */
export interface BatchCreateMedicationsResponse {
  created: number;
  updated: number;
  medications: Medication[];
}

export interface PrescriptionExtractedData {
  prescriptionDate?: string;
  doctorName?: string;
  medications?: { name: string; dosage: string; frequency: string; duration?: string }[];
  instructions?: string;
}
