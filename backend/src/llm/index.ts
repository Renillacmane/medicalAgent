/**
 * LLM module: provider-agnostic interfaces and implementations.
 *
 * Usage (standalone):
 *   import { createLLMService, createOpenAILLMService } from './llm';
 *   const llm = createOpenAILLMService(process.env.OPENAI_API_KEY!, 'gpt-4o');
 *   const result = await llm.text.generator.generate({ prompt: '...', system: '...' });
 *
 * Usage (NestJS):
 *   @Inject(LLM_TEXT_GENERATOR) private readonly textGenerator: TextGenerator
 *   const result = await this.textGenerator.generate({ prompt, system });
 */

// Public interfaces (what consumers depend on)
export * from './interfaces';

// LLM service types and factory
export * from './llm-service.types';
export * from './llm-provider-factory';

// NestJS module
export * from './llm.module';

// Prompts (formatters consume DTOs from other modules, e.g. patients)
export * from './prompts';

// Provider implementations (for direct use or testing)
export { createOpenAIClient } from './providers/openai/client';
export { OPENAI_MODELS, OPENAI_DEFAULTS } from './providers/openai/config';
export { createOpenAILLMService } from './providers/openai/openai-llm-service';
export { createGeminiLLMService } from './providers/gemini/gemini-llm-service';
