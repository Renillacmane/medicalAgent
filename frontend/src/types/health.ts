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

export interface PrescriptionExtractedData {
  prescriptionDate?: string;
  doctorName?: string;
  medications?: { name: string; dosage: string; frequency: string; duration?: string }[];
  instructions?: string;
}
