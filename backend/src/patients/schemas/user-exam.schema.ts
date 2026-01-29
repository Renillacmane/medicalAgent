import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserExamDocument = UserExam & Document;

@Schema({ timestamps: true, collection: 'userexams' })
export class UserExam {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String })
  attachmentId?: string; // ref to attachment storage (ObjectId hex or storage key)
}

export const UserExamSchema = SchemaFactory.createForClass(UserExam);
UserExamSchema.index({ userId: 1 });
UserExamSchema.index({ userId: 1, date: -1 });
