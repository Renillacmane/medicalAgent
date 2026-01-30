import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UserVital, UserVitalDocument } from './schemas/user-vital.schema';
import { CreateVitalDto } from './dto';

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

  async getVitals(userId: string, limit = 100) {
    const vitals = await this.userVitalModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .limit(limit)
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
}
