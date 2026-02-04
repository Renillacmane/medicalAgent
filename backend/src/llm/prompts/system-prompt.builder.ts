import { Injectable } from '@nestjs/common';
import { RagChunk } from '../../rag/rag.interface';
import type { PatientSnapshotDto } from '../../patients/dto/patient-snapshot.dto';
import { formatPatientSnapshotForLlm } from './patient-snapshot.formatter';
import {
  SAFETY_RULES,
  AGENT_ROLE,
  OUTPUT_FORMAT,
  USER_MESSAGE_TEMPLATE,
  RAG_CONTEXT_HEADER,
  NO_RAG_CONTEXT,
} from './prompts.config';

/**
 * Result of building prompts - matches TextGenerationInput shape
 */
export interface PromptBuildResult {
  system: string;
  prompt: string;
}

/**
 * System Prompt Builder
 *
 * Builds the system and user prompts for LLM calls.
 * Ensures all prompts include safety rules and proper formatting.
 *
 * Returns { system, prompt } to match TextGenerationInput interface.
 */
@Injectable()
export class SystemPromptBuilder {
  /**
   * Build the complete prompt inputs for the LLM.
   *
   * @param snapshot - Patient data snapshot
   * @param ragChunks - Optional RAG context chunks
   * @returns { system, prompt } ready for TextGenerator.generate()
   */
  build(
    snapshot: PatientSnapshotDto,
    ragChunks: RagChunk[] = [],
  ): PromptBuildResult {
    const system = this.buildSystemPrompt();
    const prompt = this.buildUserPrompt(snapshot, ragChunks);

    return { system, prompt };
  }

  /**
   * Build the system prompt with role, safety rules, and output format.
   */
  private buildSystemPrompt(): string {
    return [AGENT_ROLE, '', SAFETY_RULES, '', OUTPUT_FORMAT].join('\n');
  }

  /**
   * Build the user prompt with patient context and optional RAG context.
   */
  private buildUserPrompt(
    snapshot: PatientSnapshotDto,
    ragChunks: RagChunk[],
  ): string {
    const patientContext = formatPatientSnapshotForLlm(snapshot);
    const ragContext = this.formatRagContext(ragChunks);

    return USER_MESSAGE_TEMPLATE.replace('{patientContext}', patientContext).replace(
      '{ragContext}',
      ragContext,
    );
  }

  /**
   * Format RAG chunks for inclusion in the prompt.
   */
  private formatRagContext(chunks: RagChunk[]): string {
    if (!chunks || chunks.length === 0) {
      return NO_RAG_CONTEXT;
    }

    const formattedChunks = chunks
      .map((chunk, i) => {
        const source = chunk.source ? ` (source: ${chunk.source})` : '';
        return `[${i + 1}]${source}\n${chunk.content}`;
      })
      .join('\n\n');

    return RAG_CONTEXT_HEADER.replace('{ragChunks}', formattedChunks);
  }

  /**
   * Get the current prompt version for tracking/logging.
   */
  getPromptVersion(): string {
    return '1.0.0';
  }
}
