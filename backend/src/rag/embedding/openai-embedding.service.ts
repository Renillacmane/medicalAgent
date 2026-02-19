import { Injectable } from '@nestjs/common';
import type OpenAI from 'openai';
import type { IEmbeddingService } from './embedding.interface';

/** Default model; 1536 dimensions to match MongoDB vector index. */
export const OPENAI_EMBEDDING_MODEL_DEFAULT = 'text-embedding-3-small';

@Injectable()
export class OpenAIEmbeddingService implements IEmbeddingService {
  constructor(
    private readonly client: OpenAI,
    private readonly model: string = OPENAI_EMBEDDING_MODEL_DEFAULT,
  ) {}

  async embed(text: string): Promise<number[]> {
    if (!text?.trim()) {
      return this.embed(' '); // avoid empty input
    }
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text.trim().slice(0, 8191), // stay within token limit
      encoding_format: 'float',
    });
    const vector = response.data?.[0]?.embedding;
    if (!Array.isArray(vector)) {
      throw new Error('OpenAI embeddings: unexpected response shape');
    }
    return vector;
  }
}
