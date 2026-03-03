import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UserVital, UserVitalDocument } from './schemas/user-vital.schema';
import { UserExam, UserExamDocument } from './schemas/user-exam.schema';
import { UserDocument as UserDocumentModel, UserDocumentDocument } from './schemas/user-document.schema';
import { UserMedication, UserMedicationDocument } from './schemas/user-medication.schema';
import {
  CreateVitalDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  BatchCreateMedicationsDto,
} from './dto';
import { PatientSnapshotDto, PatientProfile, PatientVital, PatientMedication } from './dto/patient-snapshot.dto';

function computeBmi(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserVital.name)
    private userVitalModel: Model<UserVitalDocument>,
    @InjectModel(UserExam.name) private userExamModel: Model<UserExamDocument>,
    @InjectModel(UserDocumentModel.name)
    private userDocumentModel: Model<UserDocumentDocument>,
    @InjectModel(UserMedication.name)
    private userMedicationModel: Model<UserMedicationDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash').lean().exec();
    if (!user) return null;
    const id = (user as { _id: Types.ObjectId })._id?.toString?.();
    return { id, ...user };
  }

  /**
   * Get notification settings for a user (for Settings/Profile page).
   * Returns defaults from schema if not explicitly set.
   */
  async getSettings(userId: string) {
    const user = await this.userModel.findById(userId).select('notificationSettings').lean().exec();
    if (!user) return null;
    const defaults = {
      dailyRecommendations: false,
      vitalsReminder: true,
      medicationReminder: false,
    };
    return {
      notificationSettings: {
        ...defaults,
        ...(user.notificationSettings || {}),
      },
    };
  }

  /**
   * Update notification settings for a user.
   * Merges incoming values with existing; only provided fields are updated.
   */
  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.userModel.findById(userId).select('notificationSettings').lean().exec();
    if (!user) return null;
    const defaults = {
      dailyRecommendations: false,
      vitalsReminder: true,
      medicationReminder: false,
    };
    const current = { ...defaults, ...(user.notificationSettings || {}) };
    const incoming = dto.notificationSettings || {};
    const notificationSettings = {
      dailyRecommendations: incoming.dailyRecommendations ?? current.dailyRecommendations,
      vitalsReminder: incoming.vitalsReminder ?? current.vitalsReminder,
      medicationReminder: incoming.medicationReminder ?? current.medicationReminder,
    };
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: { notificationSettings } }, { new: true })
      .select('notificationSettings')
      .lean()
      .exec();
    if (!updated) return null;
    return {
      notificationSettings: {
        ...defaults,
        ...(updated.notificationSettings || {}),
      },
    };
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

  async getMedications(userId: string) {
    const medications = await this.userMedicationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ name: 1 })
      .lean()
      .exec();
    return medications.map((m) => ({
      id: (m as { _id: Types.ObjectId })._id?.toString?.(),
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      timesPerDay: m.timesPerDay,
      reminderTimes: m.reminderTimes,
      activeSubstance: m.activeSubstance,
      purpose: m.purpose,
      startDate: m.startDate,
      endDate: m.endDate,
      isActive: m.isActive,
      sourceDocumentId: m.sourceDocumentId?.toString(),
    }));
  }

  async deleteMedication(userId: string, medicationId: string): Promise<boolean> {
    const result = await this.userMedicationModel
      .deleteOne({ _id: new Types.ObjectId(medicationId), userId: new Types.ObjectId(userId) })
      .exec();
    return result.deletedCount > 0;
  }

  async updateMedication(userId: string, medicationId: string, dto: UpdateMedicationDto) {
    const medication = await this.userMedicationModel
      .findOne({ _id: new Types.ObjectId(medicationId), userId: new Types.ObjectId(userId) })
      .exec();
    if (!medication) return null;

    const update: Record<string, unknown> = {};
    if (dto.name != null) update.name = dto.name.trim();
    if (dto.dosage != null) update.dosage = dto.dosage.trim();
    if (dto.frequency != null) update.frequency = dto.frequency.trim();
    if (dto.timesPerDay != null) update.timesPerDay = dto.timesPerDay;
    if (dto.reminderTimes != null) update.reminderTimes = dto.reminderTimes;
    if (dto.activeSubstance != null) update.activeSubstance = dto.activeSubstance.trim();
    if (dto.purpose != null) update.purpose = dto.purpose.trim();
    if (dto.startDate != null) update.startDate = new Date(dto.startDate);
    if (dto.endDate != null) update.endDate = new Date(dto.endDate);
    if (dto.isActive != null) update.isActive = dto.isActive;

    const updated = await this.userMedicationModel
      .findByIdAndUpdate(medicationId, { $set: update }, { new: true })
      .lean()
      .exec();
    if (!updated) return null;

    return {
      id: (updated as { _id: Types.ObjectId })._id?.toString?.(),
      name: updated.name,
      dosage: updated.dosage,
      frequency: updated.frequency,
      timesPerDay: updated.timesPerDay,
      reminderTimes: updated.reminderTimes,
      activeSubstance: updated.activeSubstance,
      purpose: updated.purpose,
      startDate: updated.startDate,
      endDate: updated.endDate,
      isActive: updated.isActive,
      sourceDocumentId: updated.sourceDocumentId?.toString(),
    };
  }

  async createMedication(userId: string, dto: CreateMedicationDto) {
    const payload: Partial<UserMedication> = {
      userId: new Types.ObjectId(userId),
      name: dto.name.trim(),
      dosage: dto.dosage?.trim(),
      frequency: dto.frequency?.trim(),
      timesPerDay: dto.timesPerDay ?? 1,
      reminderTimes: dto.reminderTimes ?? [],
      activeSubstance: dto.activeSubstance?.trim(),
      purpose: dto.purpose?.trim(),
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isActive: dto.isActive ?? true,
      sourceDocumentId: dto.sourceDocumentId ? new Types.ObjectId(dto.sourceDocumentId) : undefined,
    };

    const created = await this.userMedicationModel.create(payload);
    const doc = created.toObject();
    const id = (doc as { _id: Types.ObjectId })._id?.toString?.();
    return {
      id,
      name: doc.name,
      dosage: doc.dosage,
      frequency: doc.frequency,
      timesPerDay: doc.timesPerDay,
      reminderTimes: doc.reminderTimes,
      activeSubstance: doc.activeSubstance,
      purpose: doc.purpose,
      startDate: doc.startDate,
      endDate: doc.endDate,
      isActive: doc.isActive,
      sourceDocumentId: doc.sourceDocumentId?.toString(),
    };
  }

  async batchCreateMedications(userId: string, dto: BatchCreateMedicationsDto) {
    const userObjectId = new Types.ObjectId(userId);
    const sourceDocumentId = dto.sourceDocumentId ? new Types.ObjectId(dto.sourceDocumentId) : undefined;

    const existing = await this.userMedicationModel.find({ userId: userObjectId }).lean().exec();

    const existingIdByName = new Map<string, string>(
      existing.map((m) => [m.name.toLowerCase(), (m as { _id: Types.ObjectId })._id.toString()]),
    );

    let createdCount = 0;
    let updatedCount = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const item of dto.medications) {
      const nameLower = item.name.trim().toLowerCase();
      const matchId = existingIdByName.get(nameLower);

      if (matchId) {
        const update: Record<string, unknown> = {};
        if (item.dosage != null) update.dosage = item.dosage.trim();
        if (item.frequency != null) update.frequency = item.frequency.trim();
        if (item.timesPerDay != null) update.timesPerDay = item.timesPerDay;
        if (item.reminderTimes != null) update.reminderTimes = item.reminderTimes;
        if (item.activeSubstance != null) update.activeSubstance = item.activeSubstance.trim();
        if (item.purpose != null) update.purpose = item.purpose.trim();
        if (item.startDate != null) update.startDate = new Date(item.startDate);
        if (item.endDate != null) update.endDate = new Date(item.endDate);
        if (item.isActive != null) update.isActive = item.isActive;
        if (sourceDocumentId) update.sourceDocumentId = sourceDocumentId;

        const updated = await this.userMedicationModel
          .findByIdAndUpdate(matchId, { $set: update }, { new: true })
          .lean()
          .exec();

        if (updated) {
          updatedCount++;
          results.push({
            id: (updated as { _id: Types.ObjectId })._id?.toString?.(),
            name: updated.name,
            dosage: updated.dosage,
            frequency: updated.frequency,
            timesPerDay: updated.timesPerDay,
            reminderTimes: updated.reminderTimes,
            activeSubstance: updated.activeSubstance,
            purpose: updated.purpose,
            startDate: updated.startDate,
            endDate: updated.endDate,
            isActive: updated.isActive,
            sourceDocumentId: updated.sourceDocumentId?.toString(),
          });
        }
      } else {
        const payload: Partial<UserMedication> = {
          userId: userObjectId,
          name: item.name.trim(),
          dosage: item.dosage?.trim(),
          frequency: item.frequency?.trim(),
          timesPerDay: item.timesPerDay ?? 1,
          reminderTimes: item.reminderTimes ?? [],
          activeSubstance: item.activeSubstance?.trim(),
          purpose: item.purpose?.trim(),
          startDate: item.startDate ? new Date(item.startDate) : new Date(),
          endDate: item.endDate ? new Date(item.endDate) : null,
          isActive: item.isActive ?? true,
          sourceDocumentId,
        };

        const created = await this.userMedicationModel.create(payload);
        const doc = created.toObject();
        createdCount++;
        results.push({
          id: (doc as { _id: Types.ObjectId })._id?.toString?.(),
          name: doc.name,
          dosage: doc.dosage,
          frequency: doc.frequency,
          timesPerDay: doc.timesPerDay,
          reminderTimes: doc.reminderTimes,
          activeSubstance: doc.activeSubstance,
          purpose: doc.purpose,
          startDate: doc.startDate,
          endDate: doc.endDate,
          isActive: doc.isActive,
          sourceDocumentId: doc.sourceDocumentId?.toString(),
        });

        existingIdByName.set(nameLower, (doc as { _id: Types.ObjectId })._id.toString());
      }
    }

    return { created: createdCount, updated: updatedCount, medications: results };
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
    const vitals = await this.userVitalModel.find(filter).sort({ date: -1 }).limit(limit).lean().exec();
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
        const user = await this.userModel.findById(userId).select('height').lean().exec();
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
  async getPatientSnapshotForAgent(userId: string, vitalsLimit = 30): Promise<PatientSnapshotDto> {
    const [profileData, vitalsData, medicationsData] = await Promise.all([
      this.getProfile(userId),
      this.getVitals(userId, vitalsLimit),
      this.getMedications(userId),
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

    const medications: PatientMedication[] = medicationsData
      .filter((m) => m.isActive)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        timesPerDay: m.timesPerDay,
        reminderTimes: m.reminderTimes,
        startDate: m.startDate,
        endDate: m.endDate,
        isActive: m.isActive,
      }));

    return {
      profile,
      vitals,
      medications,
      // Phase 2+:
      // exams: await this.getExams(userId),
    };
  }
}
