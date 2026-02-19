import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Document chunk with embedding for vector search.
 * Stored in collection `documentchunks`; vector index on `embedding`.
 */
@Schema({ collection: 'documentchunks', timestamps: true })
export class DocumentChunk extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  sourceType: string;

  @Prop()
  documentType?: string;

  @Prop()
  specialty?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserDocument' })
  documentId?: Types.ObjectId;

  @Prop({ required: true })
  chunkIndex: number;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);

// Indexes other than vector are defined in MongoDB / Atlas as needed (userId, sourceType, etc.).
// Vector index must be created in Atlas on path 'embedding' (name: vector_index).
