import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UserVital, UserVitalDocument } from './schemas/user-vital.schema';
import { UserExam, UserExamDocument } from './schemas/user-exam.schema';
import { UserDocument as UserDocumentModel, UserDocumentDocument } from './schemas/user-document.schema';
import { CreateVitalDto, UpdateProfileDto } from './dto';
import {
  PatientSnapshotDto,
  PatientProfile,
  PatientVital,
} from './dto/patient-snapshot.dto';

function computeBmi(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserVital.name) private userVitalModel: Model<UserVitalDocument>,
    @InjectModel(UserExam.name) private userExamModel: Model<UserExamDocument>,
    @InjectModel(UserDocumentModel.name) private userDocumentModel: Model<UserDocumentDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash')
      .lean()
      .exec();
    if (!user) return null;
    const id = (user as { _id: Types.ObjectId })._id?.toString?.();
    return { id, ...user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const update: Record<string, unknown> = {};
    if (dto.firstName != null) update.firstName = dto.firstName.trim();
    if (dto.lastName != null) update.lastName = dto.lastName.trim();
    if (dto.dateOfBirth != null) update.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.height != null) update.height = dto.height;
    if (dto.weight != null) update.weight = dto.weight;
    if (dto.isActive != null) update.isActive = dto.isActive;
    if (dto.dietaryPreference != null) update.dietaryPreference = dto.dietaryPreference;
    if (dto.objectives != null) update.objectives = dto.objectives;

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select('-passwordHash')
      .lean()
      .exec();
    if (!updated) return null;
    const id = (updated as { _id: Types.ObjectId })._id?.toString?.();
    return { id, ...updated };
  }

  /**
   * Get exams for a user (e.g. for My Health / Exams tab).
   */
  async getExams(userId: string) {
    const exams = await this.userExamModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .limit(100)
      .lean()
      .exec();
    return exams.map((e) => ({
      id: (e as { _id: Types.ObjectId })._id?.toString?.(),
      name: e.name,
      date: e.date,
      attachmentId: e.attachmentId,
    }));
  }

  /**
   * Get user documents (e.g. prescriptions, medical reports) for My Health.
   * @param documentType - Optional filter: 'prescription' | 'medical_report' | 'blood_analysis' | etc.
   */
  async getDocuments(userId: string, documentType?: string) {
    const filter: { userId: Types.ObjectId; documentType?: string } = {
      userId: new Types.ObjectId(userId),
    };
    if (documentType) filter.documentType = documentType;
    const docs = await this.userDocumentModel
      .find(filter)
      .sort({ documentDate: -1, processedAt: -1 })
      .limit(100)
      .lean()
      .exec();
    return docs.map((d) => ({
      id: (d as { _id: Types.ObjectId })._id?.toString?.(),
      documentType: d.documentType,
      originalFilename: d.originalFilename,
      attachmentId: d.attachmentId,
      extractedData: d.extractedData,
      analysisSummary: d.analysisSummary,
      documentDate: d.documentDate,
      processedAt: d.processedAt,
      status: d.status,
    }));
  }

  /**
   * Get vitals for a user, optionally restricted to the last N days.
   * @param userId - User ID
   * @param limit - Max number of records (default 100)
   * @param days - If set, only vitals with date >= (now - days) are returned (e.g. 7 for last week)
   */
  async getVitals(userId: string, limit = 100, days?: number) {
    const filter: { userId: Types.ObjectId; date?: { $gte: Date } } = {
      userId: new Types.ObjectId(userId),
    };
    if (days != null && days > 0) {
      const from = new Date();
      from.setDate(from.getDate() - days);
      from.setHours(0, 0, 0, 0);
      filter.date = { $gte: from };
    }
    const vitals = await this.userVitalModel
      .find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .lean()
      .exec();
    return vitals.map((v) => ({
      ...v,
      id: (v as { _id: Types.ObjectId })._id?.toString?.(),
    }));
  }

  /**
   * Get vitals for a user within a period ending on the latest vital date.
   * Finds the latest vital date, then returns all vitals from (latest date - period) to latest date.
   * @param userId - User ID
   * @param periodDays - Period in days (7, 15, or 30)
   * @returns Array of vitals sorted by date descending (newest first)
   */
  async getLatestVitalsByPeriod(userId: string, periodDays: number) {
    // First, find the latest vital date for this user
    const latestVital = await this.userVitalModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .select('date')
      .lean()
      .exec();

    // If no vitals exist, return empty array
    if (!latestVital || !latestVital.date) {
      return [];
    }

    // Calculate the start date (latest date - period days)
    const latestDate = new Date(latestVital.date);
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0);

    // Set latest date to end of day to include all vitals on that day
    const endDate = new Date(latestDate);
    endDate.setHours(23, 59, 59, 999);

    // Query vitals within the period
    const vitals = await this.userVitalModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .lean()
      .exec();

    return vitals.map((v) => ({
      ...v,
      id: (v as { _id: Types.ObjectId })._id?.toString?.(),
    }));
  }

  async createVital(userId: string, dto: CreateVitalDto) {
    const payload: Partial<UserVital> = {
      userId: new Types.ObjectId(userId),
      date: new Date(dto.date),
      heartRate: dto.heartRate,
      bloodPressure: dto.bloodPressure,
      weight: dto.weight,
      sleepHours: dto.sleepHours,
      stressPerception: dto.stressPerception,
      bloodOxygen: dto.bloodOxygen,
      bloodGlucose: dto.bloodGlucose,
    };

    if (dto.weight != null) {
      let heightCm = dto.height;
      if (heightCm == null) {
        const user = await this.userModel
          .findById(userId)
          .select('height')
          .lean()
          .exec();
        heightCm = user?.height;
      }
      if (heightCm != null && heightCm > 0) {
        payload.bmi = computeBmi(dto.weight, heightCm);
      }
    }

    const created = await this.userVitalModel.create(payload);
    const doc = created.toObject();
    const id = (doc as { _id: Types.ObjectId })._id?.toString?.();
    return { id, ...doc };
  }

  /**
   * Get patient snapshot for the AI agent.
   * Phase 1: Returns profile + vitals only.
   * Phase 2+ will add medications and exams.
   *
   * @param userId - The user ID
   * @param vitalsLimit - Max number of vitals to include (default: 30)
   * @returns PatientSnapshotDto with profile and vitals
   */
  async getPatientSnapshotForAgent(
    userId: string,
    vitalsLimit = 30,
  ): Promise<PatientSnapshotDto> {
    // Fetch profile and vitals in parallel
    const [profileData, vitalsData] = await Promise.all([
      this.getProfile(userId),
      this.getVitals(userId, vitalsLimit),
    ]);

    // Map profile to PatientProfile type
    const profile: PatientProfile | null = profileData
      ? {
          id: profileData.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth,
          email: profileData.email,
          isActive: profileData.isActive,
          height: profileData.height,
          weight: profileData.weight,
          dietaryPreference: profileData.dietaryPreference,
          objectives: profileData.objectives,
        }
      : null;

    // Map vitals to PatientVital type
    const vitals: PatientVital[] = vitalsData.map((v) => ({
      id: v.id,
      date: v.date,
      heartRate: v.heartRate,
      bloodPressure: v.bloodPressure,
      weight: v.weight,
      sleepHours: v.sleepHours,
      stressPerception: v.stressPerception,
      bmi: v.bmi,
      bloodOxygen: v.bloodOxygen,
      bloodGlucose: v.bloodGlucose,
    }));

    return {
      profile,
      vitals,
      // Phase 2+:
      // medications: await this.getMedications(userId),
      // exams: await this.getExams(userId),
    };
  }
}
