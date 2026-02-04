/**
 * Gemini LLM service assembly.
 * Exposes text via provider-agnostic LLMService interface.
 */

import type { LLMService } from '../../llm-service.types';
import { createGeminiClient } from './client';
import { GeminiProTextGenerator } from './text/gemini-pro/generate';

export function createGeminiLLMService(apiKey: string): LLMService {
  const client = createGeminiClient(apiKey);
  return {
    text: {
      generator: new GeminiProTextGenerator(client),
    },
  };
}
