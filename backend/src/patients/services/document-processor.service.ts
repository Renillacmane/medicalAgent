import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { TextGenerator } from '../../llm/interfaces/text';
import { LLM_TEXT_GENERATOR } from '../../llm/interfaces/text';
import {
  UserDocument as UserDocumentModel,
  UserDocumentDocument,
} from '../schemas/user-document.schema';

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

// TODO might be reusable for other document types

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
    this.logger.log(
      `Created ${documentType} document ${id} for user ${userId}`,
    );
    return { id, status: 'pending' };
  }

  /**
   * Process a prescription document: extract text, analyze with LLM, and save.
   */
  async processPrescription(
    userId: string,
    filename: string,
    pdfText: string,
    attachmentId: string,
  ): Promise<{ id: string; status: string }> {
    // Create document with pending status
    const doc = await this.userDocumentModel.create({
      userId: new Types.ObjectId(userId),
      documentType: 'prescription',
      originalFilename: filename,
      attachmentId,
      extractedData: {},
      analysisSummary: 'Processing...',
      processedAt: new Date(),
      status: 'processing',
    });

    try {
      // Extract structured data using LLM
      const extractedData = await this.extractPrescriptionData(pdfText);

      // Generate summary
      const summary = this.generateSummary(extractedData);

      // Parse prescription date
      let documentDate: Date | undefined;
      if (extractedData.prescriptionDate) {
        const parsed = new Date(extractedData.prescriptionDate);
        if (!isNaN(parsed.getTime())) {
          documentDate = parsed;
        }
      }

      // Update document with extracted data
      await this.userDocumentModel.findByIdAndUpdate(doc._id, {
        extractedData,
        analysisSummary: summary,
        documentDate,
        status: 'completed',
      });

      const id = doc._id.toString();
      this.logger.log(`Processed prescription ${id} for user ${userId}`);
      return { id, status: 'completed' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process prescription ${doc._id}: ${errorMessage}`,
      );

      await this.userDocumentModel.findByIdAndUpdate(doc._id, {
        status: 'failed',
        errorMessage,
      });

      throw error;
    }
  }

  /**
   * Extract structured data from prescription text using LLM.
   */
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
      system:
        'You are a medical document analysis assistant. Extract structured data from prescription documents.',
      prompt,
    });

    // Parse JSON from response
    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      let jsonText = response.text.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonText);
      return {
        prescriptionDate: parsed.prescriptionDate,
        doctorName: parsed.doctorName,
        medications: parsed.medications || [],
        instructions: parsed.instructions,
      };
    } catch (parseError) {
      this.logger.warn(
        `Failed to parse LLM response as JSON: ${response.text.substring(0, 200)}`,
      );
      // Return minimal structure if parsing fails
      return {
        medications: [],
      };
    }
  }

  /**
   * Generate a human-readable summary from extracted data.
   */
  private generateSummary(data: {
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
}
