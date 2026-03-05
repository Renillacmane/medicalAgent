import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { PatientsService } from './patients.service';
import { DocumentProcessorService } from './services/document-processor.service';
import {
  CreateVitalDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  BatchCreateMedicationsDto,
} from './dto';
import { PDFParse } from 'pdf-parse';
import type { LoadParameters } from 'pdf-parse';
import * as path from 'path';
import * as fs from 'fs';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly documentProcessor: DocumentProcessorService,
  ) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const profile = await this.patientsService.getProfile(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const profile = await this.patientsService.updateProfile(userId, dto);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get('settings')
  async getSettings(@CurrentUser() user: User) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const settings = await this.patientsService.getSettings(userId);
    if (!settings) {
      throw new NotFoundException('User not found');
    }
    return settings;
  }

  @Patch('settings')
  async updateSettings(@CurrentUser() user: User, @Body() dto: UpdateSettingsDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const settings = await this.patientsService.updateSettings(userId, dto);
    if (!settings) {
      throw new NotFoundException('User not found');
    }
    return settings;
  }

  @Get('exams')
  async getExams(@CurrentUser() user: User) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.getExams(userId);
  }

  @Get('documents')
  async getDocuments(@CurrentUser() user: User, @Query('documentType') documentType?: string) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.getDocuments(userId, documentType);
  }

  @Get('documents/:id')
  async getDocument(@CurrentUser() user: User, @Param('id') id: string) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const document = await this.patientsService.getDocument(userId, id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  @Post('documents/upload')
  async uploadDocument(
    @CurrentUser() user: User,
    @Req()
    req: FastifyRequest & {
      isMultipart: () => boolean;
      file: () => Promise<any>;
    },
  ) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart');
    }

    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    const fields = data.fields as Record<string, { value?: unknown }> | undefined;
    const documentTypeValue = fields?.documentType?.value;
    const documentType = (typeof documentTypeValue === 'string' ? documentTypeValue : undefined) || 'prescription';

    if (data.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    const allowedTypes = ['prescription', 'lab_result'];
    if (!allowedTypes.includes(documentType)) {
      throw new BadRequestException(`Unsupported document type "${documentType}". Allowed: ${allowedTypes.join(', ')}`);
    }

    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';

    const buffer = await data.toBuffer();

    let pdfText: string;
    try {
      const loadParams: LoadParameters = { data: buffer };
      const parser = new PDFParse(loadParams);
      const textResult = await parser.getText();
      pdfText = textResult.text;
      await parser.destroy();
    } catch {
      throw new BadRequestException('Failed to parse PDF file');
    }

    // Default: public/documents (dev). Set DOCUMENTS_UPLOAD_DIR to frontend/out/documents for static export deploy.
    const publicDir =
      process.env.DOCUMENTS_UPLOAD_DIR || path.join(process.cwd(), '..', 'frontend', 'public', 'documents');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filename = `${Date.now()}_${String(data.filename)}`;
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, buffer);
    const attachmentId = `/documents/${filename}`;

    const processors: Record<
      string,
      () => Promise<
        { id: string; status: string } & {
          extractedData?: {
            prescriptionDate?: string;
            doctorName?: string;
            medications?: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
            instructions?: string;
          };
        }
      >
    > = {
      prescription: () => this.documentProcessor.processPrescription(userId, data.filename, pdfText, attachmentId),
      lab_result: () => this.documentProcessor.processLabResults(userId, data.filename, pdfText, attachmentId),
    };

    const processFn = processors[documentType];
    if (processFn) {
      const result = await processFn();
      const response: {
        id: string;
        status: string;
        message: string;
        extractedData?: (typeof result)['extractedData'];
      } = {
        id: result.id,
        status: result.status,
        message: 'Document uploaded and processing started',
      };
      if (documentType === 'prescription' && 'extractedData' in result && result.extractedData) {
        response.extractedData = result.extractedData;
      }
      return response;
    }

    const result = await this.documentProcessor.createDocumentRecord(userId, documentType, data.filename, attachmentId);
    return {
      id: result.id,
      status: result.status,
      message: 'Document uploaded successfully',
    };
  }

  @Get('medications')
  async getMedications(@CurrentUser() user: User) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.getMedications(userId);
  }

  @Post('medications')
  async createMedication(@CurrentUser() user: User, @Body() dto: CreateMedicationDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.createMedication(userId, dto);
  }

  @Post('medications/batch')
  async batchCreateMedications(@CurrentUser() user: User, @Body() dto: BatchCreateMedicationsDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.batchCreateMedications(userId, dto);
  }

  @Patch('medications/:id')
  async updateMedication(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const medication = await this.patientsService.updateMedication(userId, id, dto);
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    return medication;
  }

  @Delete('medications/:id')
  async deleteMedication(@CurrentUser() user: User, @Param('id') id: string) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const deleted = await this.patientsService.deleteMedication(userId, id);
    if (!deleted) {
      throw new NotFoundException('Medication not found');
    }
    return { success: true };
  }

  @Get('vitals')
  async getVitals(@CurrentUser() user: User, @Query('limit') limit?: string, @Query('days') days?: string) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const limitNum = limit != null ? Math.min(parseInt(limit, 10) || 100, 500) : 100;
    const daysNum = days != null ? Math.min(Math.max(1, parseInt(days, 10) || 7), 365) : undefined;
    return this.patientsService.getVitals(userId, limitNum, daysNum);
  }

  @Get('vitals/latest-by-period')
  async getLatestVitalsByPeriod(@CurrentUser() user: User, @Query('period') period?: string) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';

    // Validate period parameter - must be 7, 15, or 30
    const periodNum = period != null ? parseInt(period, 10) : 7;
    if (![7, 15, 30].includes(periodNum)) {
      throw new BadRequestException('Period must be 7, 15, or 30 days');
    }

    return this.patientsService.getLatestVitalsByPeriod(userId, periodNum);
  }

  @Post('vitals')
  async createVital(@CurrentUser() user: User, @Body() dto: CreateVitalDto) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.createVital(userId, dto);
  }
}
