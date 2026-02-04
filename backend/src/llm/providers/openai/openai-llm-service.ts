/**
 * OpenAI LLM service assembly.
 * Exposes text (and optional audio) via provider-agnostic LLMService interface.
 */

import type { LLMService } from '../../llm-service.types';
import { createOpenAIClient } from './client';
import { GPT41MiniTextGenerator } from './text/gpt-4.1-mini/generate';
import { GPT4oTextGenerator } from './text/gpt-4o/generate';
import { OPENAI_MODELS } from './config';

export type OpenAIModelVariant = 'gpt-4.1-mini' | 'gpt-4o';

/**
 * Create OpenAI LLM service with the given API key and optional model variant.
 * Model variant selects which text generator is used (no conditionals in runtime logic).
 */
export function createOpenAILLMService(
  apiKey: string,
  modelVariant: OpenAIModelVariant = 'gpt-4o',
): LLMService {
  const client = createOpenAIClient(apiKey);

  const generatorByModel: Record<OpenAIModelVariant, LLMService['text']['generator']> = {
    [OPENAI_MODELS.GPT_41_MINI]: new GPT41MiniTextGenerator(client),
    [OPENAI_MODELS.GPT_4O]: new GPT4oTextGenerator(client),
  };

  const generator = generatorByModel[modelVariant] ?? new GPT4oTextGenerator(client);

  return {
    text: {
      generator,
    },
    // audio: { transcriber: new WhisperTranscriber(client) }, // when implemented
  };
}
