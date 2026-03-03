import {
  Body,
  Controller,
  Get,
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
import { CreateVitalDto, UpdateProfileDto } from './dto';
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

    const documentType = data.fields?.documentType?.value || 'prescription';

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
    } catch (error) {
      throw new BadRequestException('Failed to parse PDF file');
    }

    const publicDir = path.join(process.cwd(), '..', 'frontend', 'public', 'documents');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filename = `${Date.now()}_${data.filename}`;
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, buffer);
    const attachmentId = `/documents/${filename}`;

    const processors: Record<string, () => Promise<{ id: string; status: string }>> = {
      prescription: () => this.documentProcessor.processPrescription(userId, data.filename, pdfText, attachmentId),
      lab_result: () => this.documentProcessor.processLabResults(userId, data.filename, pdfText, attachmentId),
    };

    const processFn = processors[documentType as string];
    if (processFn) {
      const result = await processFn();
      return {
        id: result.id,
        status: result.status,
        message: 'Document uploaded and processing started',
      };
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
