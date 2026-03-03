import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { TextGenerator } from '../../llm/interfaces/text';
import { LLM_TEXT_GENERATOR } from '../../llm/interfaces/text';
import { UserDocument as UserDocumentModel, UserDocumentDocument } from '../schemas/user-document.schema';

const PRESCRIPTION_PROMPT = `
You are analyzing a prescription document. Extract medication information.

Extract:
1. Prescription date
2. Doctor name (if available)
3. List of medications with: name, dosage, frequency, duration

Return ONLY valid JSON in this format:
{
  "prescriptionDate": "YYYY-MM-DD",
  "doctorName": "Dr. Smith",
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "10mg",
      "frequency": "once daily",
      "duration": "30 days"
    }
  ],
  "instructions": "Additional instructions if any"
}
`;

const LAB_RESULTS_PROMPT = `
You are analyzing a lab results document. Extract all test results and metadata.

Extract:
1. Date the lab tests were performed
2. Laboratory or facility name (if available)
3. Ordering doctor name (if available)
4. List of test results with: test name, value, unit, reference range, and flag (normal, high, or low)
5. Any notes or comments from the lab

Return ONLY valid JSON in this format:
{
  "labDate": "YYYY-MM-DD",
  "labName": "Laboratory Name",
  "doctorName": "Dr. Smith",
  "results": [
    {
      "testName": "Hemoglobin",
      "value": "14.5",
      "unit": "g/dL",
      "referenceRange": "12.0-17.5",
      "flag": "normal"
    }
  ],
  "notes": "Any additional notes or comments"
}
`;

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    @InjectModel(UserDocumentModel.name)
    private userDocumentModel: Model<UserDocumentDocument>,
    @Inject(LLM_TEXT_GENERATOR) private readonly textGenerator: TextGenerator,
  ) {}

  /**
   * Create a document record without type-specific LLM processing.
   * Used as a baseline for document types whose processors are not yet wired.
   */
  async createDocumentRecord(
    userId: string,
    documentType: string,
    filename: string,
    attachmentId: string,
  ): Promise<{ id: string; status: string }> {
    const doc = await this.userDocumentModel.create({
      userId: new Types.ObjectId(userId),
      documentType,
      originalFilename: filename,
      attachmentId,
      extractedData: {},
      analysisSummary: 'Pending processing',
      processedAt: new Date(),
      status: 'pending',
    });

    const id = doc._id.toString();
    this.logger.log(`Created ${documentType} document ${id} for user ${userId}`);
    return { id, status: 'pending' };
  }

  /**
   * Shared pipeline: create a processing record, run type-specific extraction,
   * update with results, and handle errors.
   */
  private async processDocument<T extends Record<string, unknown>>(
    userId: string,
    documentType: string,
    filename: string,
    pdfText: string,
    attachmentId: string,
    extract: (text: string) => Promise<T>,
    summarize: (data: T) => string,
    parseDateField: (data: T) => Date | undefined,
  ): Promise<{ id: string; status: string; extractedData?: T }> {
    const doc = await this.userDocumentModel.create({
      userId: new Types.ObjectId(userId),
      documentType,
      originalFilename: filename,
      attachmentId,
      extractedData: {},
      analysisSummary: 'Processing...',
      processedAt: new Date(),
      status: 'processing',
    });

    try {
      const extractedData = await extract(pdfText);
      const summary = summarize(extractedData);
      const documentDate = parseDateField(extractedData);

      await this.userDocumentModel.findByIdAndUpdate(doc._id, {
        extractedData,
        analysisSummary: summary,
        documentDate,
        status: 'completed',
      });

      const id = doc._id.toString();
      this.logger.log(`Processed ${documentType} ${id} for user ${userId}`);
      return { id, status: 'completed', extractedData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process ${documentType} ${doc._id.toString()}: ${errorMessage}`);

      await this.userDocumentModel.findByIdAndUpdate(doc._id, {
        status: 'failed',
        errorMessage,
      });

      throw error;
    }
  }

  async processPrescription(
    userId: string,
    filename: string,
    pdfText: string,
    attachmentId: string,
  ): Promise<{
    id: string;
    status: string;
    extractedData?: {
      prescriptionDate?: string;
      doctorName?: string;
      medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
      instructions?: string;
    };
  }> {
    return this.processDocument(
      userId,
      'prescription',
      filename,
      pdfText,
      attachmentId,
      (text) => this.extractPrescriptionData(text),
      (data) => this.generatePrescriptionSummary(data),
      (data) => this.parseDate(data.prescriptionDate),
    );
  }

  async processLabResults(
    userId: string,
    filename: string,
    pdfText: string,
    attachmentId: string,
  ): Promise<{ id: string; status: string }> {
    return this.processDocument(
      userId,
      'lab_result',
      filename,
      pdfText,
      attachmentId,
      (text) => this.extractLabResultsData(text),
      (data) => this.generateLabResultsSummary(data),
      (data) => this.parseDate(data.labDate),
    );
  }

  private parseDate(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  /**
   * Parse JSON from an LLM response that may be wrapped in markdown code fences.
   */
  private parseLlmJson(responseText: string): Record<string, unknown> {
    let jsonText = responseText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    return JSON.parse(jsonText) as Record<string, unknown>;
  }

  private async extractPrescriptionData(pdfText: string): Promise<{
    prescriptionDate?: string;
    doctorName?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
    }>;
    instructions?: string;
  }> {
    const prompt = `${PRESCRIPTION_PROMPT}\n\nDocument text:\n${pdfText.substring(0, 4000)}`;

    const response = await this.textGenerator.generate({
      system: 'You are a medical document analysis assistant. Extract structured data from prescription documents.',
      prompt,
    });

    try {
      const parsed = this.parseLlmJson(response.text);
      return {
        prescriptionDate: parsed.prescriptionDate as string | undefined,
        doctorName: parsed.doctorName as string | undefined,
        medications:
          (parsed.medications as Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration?: string;
          }>) || [],
        instructions: parsed.instructions as string | undefined,
      };
    } catch {
      this.logger.warn(`Failed to parse LLM response as JSON: ${response.text.substring(0, 200)}`);
      return { medications: [] };
    }
  }

  private async extractLabResultsData(pdfText: string): Promise<{
    labDate?: string;
    labName?: string;
    doctorName?: string;
    results: Array<{
      testName: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      flag?: string;
    }>;
    notes?: string;
  }> {
    const prompt = `${LAB_RESULTS_PROMPT}\n\nDocument text:\n${pdfText.substring(0, 4000)}`;

    const response = await this.textGenerator.generate({
      system: 'You are a medical document analysis assistant. Extract structured data from lab result documents.',
      prompt,
    });

    try {
      const parsed = this.parseLlmJson(response.text);
      return {
        labDate: parsed.labDate as string | undefined,
        labName: parsed.labName as string | undefined,
        doctorName: parsed.doctorName as string | undefined,
        results:
          (parsed.results as Array<{
            testName: string;
            value: string;
            unit?: string;
            referenceRange?: string;
            flag?: string;
          }>) || [],
        notes: parsed.notes as string | undefined,
      };
    } catch {
      this.logger.warn(`Failed to parse LLM response as JSON: ${response.text.substring(0, 200)}`);
      return { results: [] };
    }
  }

  private generatePrescriptionSummary(data: {
    prescriptionDate?: string;
    doctorName?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
    }>;
    instructions?: string;
  }): string {
    const parts: string[] = [];

    if (data.doctorName) {
      parts.push(`Prescribed by ${data.doctorName}`);
    }

    if (data.prescriptionDate) {
      parts.push(`Date: ${data.prescriptionDate}`);
    }

    if (data.medications && data.medications.length > 0) {
      const medNames = data.medications.map((m) => m.name).join(', ');
      parts.push(`Medications: ${medNames}`);
    }

    return parts.join('. ') || 'Prescription document processed.';
  }

  private generateLabResultsSummary(data: {
    labDate?: string;
    labName?: string;
    doctorName?: string;
    results: Array<{
      testName: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      flag?: string;
    }>;
    notes?: string;
  }): string {
    const parts: string[] = [];

    if (data.labName) {
      parts.push(`Lab: ${data.labName}`);
    }

    if (data.labDate) {
      parts.push(`Date: ${data.labDate}`);
    }

    if (data.results.length > 0) {
      const abnormal = data.results.filter((r) => r.flag && r.flag !== 'normal');
      parts.push(`${data.results.length} test(s)`);
      if (abnormal.length > 0) {
        const names = abnormal.map((r) => `${r.testName} (${r.flag})`).join(', ');
        parts.push(`Flagged: ${names}`);
      }
    }

    return parts.join('. ') || 'Lab results document processed.';
  }
}
