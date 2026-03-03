/**
 * LLM Provider Factory
 *
 * Creates LLMService instances based on provider configuration.
 * App code depends only on LLMService and interfaces; this factory wires implementations.
 */

import type { LLMService } from './llm-service.types';
import { createOpenAILLMService } from './providers/openai/openai-llm-service';
import type { OpenAIModelVariant } from './providers/openai/openai-llm-service';
import { createGeminiLLMService } from './providers/gemini/gemini-llm-service';

export type LlmProviderName = 'openai' | 'gemini';

export interface CreateLLMOptions {
  provider: LlmProviderName;
  apiKey: string;
  /** OpenAI only: which model variant to use */
  openaiModel?: OpenAIModelVariant;
}

/**
 * Create an LLMService for the given provider and config.
 * Dispatch is by provider only; no model conditionals inside providers.
 */
export function createLLMService(options: CreateLLMOptions): LLMService {
  const { provider, apiKey } = options;

  if (provider === 'openai') {
    const openaiModel: OpenAIModelVariant = options.openaiModel ?? 'gpt-4o';
    return createOpenAILLMService(apiKey, openaiModel);
  }
  if (provider === 'gemini') {
    return createGeminiLLMService(apiKey);
  }
  throw new Error(`Unknown LLM provider: ${String(provider)}`);
}

// Re-export for direct usage (e.g. llm.openai.text.generator.generate(...))
export { createOpenAILLMService } from './providers/openai/openai-llm-service';
export { createGeminiLLMService } from './providers/gemini/gemini-llm-service';
