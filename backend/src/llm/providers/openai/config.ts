/**
 * Centralized OpenAI model names and defaults.
 * Add new models here; implement variants in openai/text/<model>/.
 */

export const OPENAI_MODELS = {
  GPT_41_MINI: 'gpt-4.1-mini',
  GPT_4O: 'gpt-4o',
  WHISPER: 'whisper-1',
} as const;

export const OPENAI_DEFAULTS = {
  temperature: 0.3,
  maxTokens: 15000,
} as const;
