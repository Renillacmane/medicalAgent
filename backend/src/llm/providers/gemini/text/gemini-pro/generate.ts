/**
 * Gemini Pro text generator.
 * Implements TextGenerator using the Gemini API.
 */

import type { TextGenerator, TextGenerationInput, TextGenerationResult } from '../../../../interfaces/text';
import type { GeminiClientLike } from '../../client';

export class GeminiProTextGenerator implements TextGenerator {
  constructor(private readonly client: GeminiClientLike) {}

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const result = await this.client.generateContent(input.prompt, {
      systemInstruction: input.system,
      temperature: input.temperature,
    });
    return {
      text: result.text(),
    };
  }
}
