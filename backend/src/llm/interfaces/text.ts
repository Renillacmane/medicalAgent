/**
 * Provider-agnostic text generation interface.
 * All text-capable providers (OpenAI, Gemini, etc.) implement this.
 *
 * This is the PUBLIC interface for the llm module.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Text Generation Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TextGenerationInput {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TextGenerationResult {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface TextGenerator {
  generate(input: TextGenerationInput): Promise<TextGenerationResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// NestJS Injection Token
// ─────────────────────────────────────────────────────────────────────────────

/** Injection token for TextGenerator in NestJS */
export const LLM_TEXT_GENERATOR = Symbol('LLM_TEXT_GENERATOR');

// ─────────────────────────────────────────────────────────────────────────────
// Provider Configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Supported LLM provider types */
export type LlmProviderType = 'openai' | 'gemini';

/** Configuration for LLM provider selection */
export interface LlmConfig {
  provider: LlmProviderType;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}
