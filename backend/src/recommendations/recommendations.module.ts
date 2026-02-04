import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { RagModule } from '../rag/rag.module';
import { PatientsModule } from '../patients/patients.module';
import { AuthModule } from '../auth/auth.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

/**
 * Recommendations Module
 *
 * Provides the daily recommendations API endpoint.
 * Uses:
 * - LlmModule: For LLM provider and prompt builder
 * - RagModule: For optional context retrieval
 * - PatientsModule: For patient data access
 * - AuthModule: For JWT authentication
 */
@Module({
  imports: [LlmModule, RagModule, PatientsModule, AuthModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
