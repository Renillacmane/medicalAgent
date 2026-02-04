import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RAG_SERVICE } from './rag.interface';

@Module({
  providers: [
    RagService,
    {
      provide: RAG_SERVICE,
      useExisting: RagService,
    },
  ],
  exports: [RAG_SERVICE, RagService],
})
export class RagModule {}
