import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class UserObjectives {
  body?: string[];
  health?: string[];
  mind?: string[];
}

export class UserDietaryPreference {
  type?: string;
  restrictions?: string[];
}

export class NotificationSettings {
  dailyRecommendations?: boolean;
  vitalsReminder?: boolean;
  medicationReminder?: boolean;
}

export class NotificationDevice {
  platform?: 'ios' | 'android' | 'web';
  deviceToken?: string;
  webPushSubscription?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, type: Date })
  dateOfBirth: Date;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  height?: number; // cm

  @Prop()
  weight?: number; // kg

  @Prop({ type: Object })
  dietaryPreference?: UserDietaryPreference;

  @Prop({ type: Object })
  objectives?: UserObjectives;

  @Prop({
    type: Object,
    default: { dailyRecommendations: false, vitalsReminder: true, medicationReminder: false },
  })
  notificationSettings?: NotificationSettings;

  @Prop({ type: [Object], default: [] })
  notificationDevices?: NotificationDevice[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for login lookups
UserSchema.index({ email: 1 });
