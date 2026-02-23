import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocumentDocument = UserDocument & Document;

@Schema({ timestamps: true, collection: 'userdocuments' })
export class UserDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserExam' })
  userExamId?: Types.ObjectId;

  @Prop({ required: true })
  documentType: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  attachmentId: string;

  @Prop({ type: Object, required: true })
  extractedData: Record<string, unknown>;

  @Prop({ required: true })
  analysisSummary: string;

  @Prop({ type: Date })
  documentDate?: Date;

  @Prop({ required: true, type: Date })
  processedAt: Date;

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  status: string;

  @Prop()
  errorMessage?: string;
}

export const UserDocumentSchema = SchemaFactory.createForClass(UserDocument);
UserDocumentSchema.index({ userId: 1 });
UserDocumentSchema.index({ userId: 1, documentType: 1 });
UserDocumentSchema.index({ userId: 1, documentDate: -1 });
