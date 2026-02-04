/**
 * Template Method: shared logic for all GPT text models.
 * Subclasses define model name and optional defaults (Strategy per model variant).
 */

import type { TextGenerator } from '../../../../interfaces/text';
import type { TextGenerationInput, TextGenerationResult } from './types';
import type OpenAI from 'openai';

export abstract class GPTTextBaseProvider implements TextGenerator {
  protected abstract model: string;
  protected defaultTemperature = 0.7;
  protected defaultMaxTokens = 15000;

  constructor(protected readonly client: OpenAI) {}

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const temperature = input.temperature ?? this.defaultTemperature;
    const maxTokens = input.maxTokens ?? this.defaultMaxTokens;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...(input.system ? [{ role: 'system' as const, content: input.system }] : []),
      { role: 'user', content: input.prompt },
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const choice = response.choices[0];
    const text = choice?.message?.content ?? '';

    const result: TextGenerationResult = { text };

    if (response.usage) {
      result.usage = {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
      };
    }

    return result;
  }
}
