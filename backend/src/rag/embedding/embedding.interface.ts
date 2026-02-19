/**
 * Provider-agnostic embedding service: turn text into a vector for similarity search.
 */
export interface IEmbeddingService {
  /**
   * Embed a single text string into a vector.
   * Dimension must match the MongoDB vector index (e.g. 1536 for text-embedding-3-small).
   */
  embed(text: string): Promise<number[]>;
}

export const EMBEDDING_SERVICE = Symbol('EMBEDDING_SERVICE');
