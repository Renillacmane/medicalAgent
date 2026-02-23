import { Injectable, Logger, Inject } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import type { TextGenerator, TextGenerationResult } from '../llm/interfaces/text';
import { LLM_TEXT_GENERATOR } from '../llm/interfaces/text';
import type { IRagService, RagChunk } from '../rag/rag.interface';
import { RAG_SERVICE } from '../rag/rag.interface';
import { SystemPromptBuilder } from '../llm/prompts/system-prompt.builder';
import {
  DailyRecommendationDto,
  createEmptyRecommendation,
  isValidRecommendation,
} from './dto/daily-recommendation.dto';
import { PatientSnapshotDto } from '../patients/dto/patient-snapshot.dto';

export interface RecommendationOptions {
  /** Whether to include RAG context (default: true) */
  includeRag?: boolean;
  /** Custom query for RAG retrieval */
  ragQuery?: string;
  /** Max vitals to include in snapshot */
  vitalsLimit?: number;
  /** Override temperature for this request */
  temperature?: number;
}

/**
 * Recommendations Service
 *
 * Business logic for generating daily health recommendations.
 * Coordinates the flow:
 * 1. Load patient snapshot (profile + vitals)
 * 2. Optionally retrieve RAG context
 * 3. Build prompts with safety rules
 * 4. Call LLM text generator
 * 5. Parse and validate response
 */
@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly patientsService: PatientsService,
    @Inject(LLM_TEXT_GENERATOR) private readonly textGenerator: TextGenerator,
    @Inject(RAG_SERVICE) private readonly ragService: IRagService,
    private readonly promptBuilder: SystemPromptBuilder,
  ) {}

  /**
   * Generate daily recommendations for a user.
   *
   * @param userId - The user ID to generate recommendations for
   * @param options - Optional configuration for the recommendation generation
   * @returns DailyRecommendationDto with structured recommendations
   */
  async getDailyRecommendations(userId: string, options: RecommendationOptions = {}): Promise<DailyRecommendationDto> {
    const { includeRag = true, ragQuery, vitalsLimit = 30, temperature } = options;

    this.logger.log(`Generating daily recommendations for user ${userId}`);

    try {
      // Step 1: Load patient snapshot
      const snapshot = await this.loadPatientSnapshot(userId, vitalsLimit);

      if (!snapshot.profile) {
        this.logger.warn(`No profile found for user ${userId}`);
        return createEmptyRecommendation();
      }

      // Step 2: Optionally retrieve RAG context
      let ragChunks: RagChunk[] = [];
      if (includeRag) {
        ragChunks = await this.retrieveRagContext(userId, ragQuery);
      }

      // Step 3: Build prompts
      const { system, prompt } = this.promptBuilder.build(snapshot, ragChunks);

      // Log RAG chunks retrieved
      if (ragChunks.length > 0) {
        this.logger.log(
          `RAG chunks retrieved (${ragChunks.length}):\n${ragChunks.map((chunk, i) => `  [${i + 1}] ${chunk.source || 'no source'} (score: ${chunk.score?.toFixed(3) ?? 'N/A'}): ${chunk.content.substring(0, 100)}${chunk.content.length > 100 ? '...' : ''}`).join('\n')}`,
        );
      } else {
        this.logger.log('No RAG chunks retrieved');
      }

      // Log prompts with RAG context
      this.logger.log(`=== PROMPT SENT TO LLM ===`);
      this.logger.log(`System Prompt:\n${system}`);
      this.logger.log(`\nUser Prompt:\n${prompt}`);
      this.logger.log(`=== END PROMPT ===`);

      // Step 4: Call LLM text generator
      const llmResponse = await this.textGenerator.generate({
        prompt,
        system,
        temperature,
      });

      // Log LLM response
      this.logger.log(`=== LLM RESPONSE ===`);
      this.logger.log(`${llmResponse.text}`);
      this.logger.log(`=== END LLM RESPONSE ===`);

      // Step 5: Parse and validate response
      const recommendation = this.parseResponse(llmResponse.text);

      this.logger.log(
        `Generated recommendations for user ${userId}: ${recommendation.recommendations.nutrition?.length || 0} nutrition, ${recommendation.recommendations.exercise?.length || 0} exercise, ${recommendation.recommendations.lifestyle?.length || 0} lifestyle, ${recommendation.recommendations.alerts?.length || 0} alerts`,
      );

      return recommendation;
    } catch (error) {
      this.logger.error(`Failed to generate recommendations for user ${userId}: ${error}`);
      throw error;
    }
  }

  /**
   * Load patient snapshot from PatientsService
   */
  private async loadPatientSnapshot(userId: string, vitalsLimit: number): Promise<PatientSnapshotDto> {
    return this.patientsService.getPatientSnapshotForAgent(userId, vitalsLimit);
  }

  /**
   * Retrieve RAG context chunks
   */
  private async retrieveRagContext(userId: string, query?: string): Promise<RagChunk[]> {
    try {
      const chunks = await this.ragService.retrieve(userId, query, {
        limit: 5,
      });
      this.logger.debug(`Retrieved ${chunks.length} RAG chunks for user ${userId}`);
      return chunks;
    } catch (error) {
      this.logger.warn(`RAG retrieval failed, continuing without context: ${error}`);
      return [];
    }
  }

  /**
   * Parse LLM response into structured recommendation DTO.
   * Handles JSON parsing with fallback for malformed responses.
   */
  private parseResponse(content: string): DailyRecommendationDto {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.warn('No JSON found in LLM response, using fallback');
      return this.createFallbackRecommendation(content);
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      if (isValidRecommendation(parsed)) {
        return {
          ...parsed,
          generatedAt: new Date(),
        };
      }

      this.logger.warn('Parsed JSON does not match expected schema');
      return this.createFallbackRecommendation(content);
    } catch (error) {
      this.logger.warn(`Failed to parse JSON from LLM response: ${error}`);
      return this.createFallbackRecommendation(content);
    }
  }

  /**
   * Create a fallback recommendation when parsing fails.
   * Uses the raw content as the summary.
   */
  private createFallbackRecommendation(content: string): DailyRecommendationDto {
    // Truncate if too long
    const summary =
      content.length > 500
        ? content.substring(0, 497) + '...'
        : content || 'Unable to generate recommendations at this time.';

    return {
      summary,
      recommendations: {},
      generatedAt: new Date(),
    };
  }
}
