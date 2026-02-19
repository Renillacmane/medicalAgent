import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createOpenAIClient } from '../llm';
import { RagService } from './rag.service';
import { RAG_SERVICE } from './rag.interface';
import { DocumentChunk, DocumentChunkSchema } from './schemas/document-chunk.schema';
import {
  EMBEDDING_SERVICE,
  OpenAIEmbeddingService,
  OPENAI_EMBEDDING_MODEL_DEFAULT,
} from './embedding';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentChunk.name, schema: DocumentChunkSchema },
    ]),
  ],
  providers: [
    {
      provide: EMBEDDING_SERVICE,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('OPENAI_API_KEY') ?? '';
        const client = createOpenAIClient(apiKey);
        const model =
          config.get<string>('OPENAI_EMBEDDING_MODEL') ??
          OPENAI_EMBEDDING_MODEL_DEFAULT;
        return new OpenAIEmbeddingService(client, model);
      },
      inject: [ConfigService],
    },
    RagService,
    {
      provide: RAG_SERVICE,
      useExisting: RagService,
    },
  ],
  exports: [RAG_SERVICE, RagService],
})
export class RagModule {}
