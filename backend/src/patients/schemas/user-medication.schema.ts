import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserMedicationDocument = UserMedication & Document;

@Schema({ timestamps: true, collection: 'usermedications' })
export class UserMedication {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  dosage?: string; // e.g. "10mg"

  @Prop()
  frequency?: string; // e.g. "once daily"

  @Prop({ type: Number, default: 1 })
  timesPerDay?: number; // numeric frequency for scheduling (1, 2, 3, 4)

  @Prop({ type: [String], default: [] })
  reminderTimes?: string[]; // ["08:00", "20:00"] in HH:mm format

  @Prop()
  activeSubstance?: string;

  @Prop()
  purpose?: string;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date, default: null })
  endDate?: Date | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'UserDocument' })
  sourceDocumentId?: Types.ObjectId; // reference to prescription document if from upload
}

export const UserMedicationSchema = SchemaFactory.createForClass(UserMedication);
UserMedicationSchema.index({ userId: 1 });
