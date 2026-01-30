import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { PatientsService } from './patients.service';
import { CreateVitalDto } from './dto';

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

  @Get('vitals')
  async getVitals(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    const limitNum = limit != null ? Math.min(parseInt(limit, 10) || 100, 500) : 100;
    return this.patientsService.getVitals(userId, limitNum);
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
