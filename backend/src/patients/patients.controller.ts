import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { PatientsService } from './patients.service';
import { CreateVitalDto, UpdateProfileDto } from './dto';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

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
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
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
  async getDocuments(
    @CurrentUser() user: User,
    @Query('documentType') documentType?: string,
  ) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.getDocuments(userId, documentType);
  }

  @Get('vitals')
  async getVitals(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const limitNum = limit != null ? Math.min(parseInt(limit, 10) || 100, 500) : 100;
    const daysNum = days != null ? Math.min(Math.max(1, parseInt(days, 10) || 7), 365) : undefined;
    return this.patientsService.getVitals(userId, limitNum, daysNum);
  }

  @Post('vitals')
  async createVital(
    @CurrentUser() user: User,
    @Body() dto: CreateVitalDto,
  ) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.patientsService.createVital(userId, dto);
  }
}
