/**
 * Gemini client factory.
 * Returns a client-like object for text generation.
 * Install @google/generative-ai and implement when ready.
 */

export interface GeminiClientLike {
  generateContent(
    prompt: string,
    options?: { systemInstruction?: string; temperature?: number },
  ): Promise<{ text: () => string }>;
}

export function createGeminiClient(_apiKey?: string): GeminiClientLike {
  void _apiKey;
  // TODO: when @google/generative-ai is added:
  // import { GoogleGenerativeAI } from '@google/generative-ai';
  // return new GoogleGenerativeAI(apiKey);
  throw new Error('Gemini client not implemented. Add @google/generative-ai and implement createGeminiClient.');
}
