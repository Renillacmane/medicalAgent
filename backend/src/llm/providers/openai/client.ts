/**
 * OpenAI SDK client factory.
 * Creates a client with the given API key (e.g. from env or ConfigService).
 */

import OpenAI from 'openai';

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey: apiKey || 'not-configured',
  });
}
