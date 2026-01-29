import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserVitalDocument = UserVital & Document;

export class BloodPressure {
  systolic: number;
  diastolic: number;
}

@Schema({ timestamps: true, collection: 'uservitals' })
export class UserVital {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop()
  heartRate?: number; // bpm

  @Prop({ type: Object })
  bloodPressure?: BloodPressure;

  @Prop()
  weight?: number; // kg

  @Prop()
  sleepHours?: number;

  @Prop()
  stressPerception?: number; // e.g. 1-10

  @Prop()
  bmi?: number;

  @Prop()
  bloodOxygen?: number; // SpO2 %

  @Prop()
  bloodGlucose?: number; // mg/dL or mmol/L
}

export const UserVitalSchema = SchemaFactory.createForClass(UserVital);
UserVitalSchema.index({ userId: 1 });
UserVitalSchema.index({ userId: 1, date: -1 });
