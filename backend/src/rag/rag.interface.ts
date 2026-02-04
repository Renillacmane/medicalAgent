/**
 * RAG (Retrieval-Augmented Generation) Service Interface
 *
 * Defines the contract for retrieving context chunks from vector stores
 * or other knowledge sources. Used to inject relevant medical context
 * into LLM prompts.
 */

export interface RagChunk {
  /** The text content of the retrieved chunk */
  content: string;
  /** Optional source identifier (e.g., document name, URL) */
  source?: string;
  /** Optional relevance score (0-1) */
  score?: number;
}

export interface RagRetrieveOptions {
  /** Maximum number of chunks to retrieve (default: 5) */
  limit?: number;
  /** Minimum relevance score threshold (0-1) */
  minScore?: number;
  /** Optional specialty filter (e.g., 'cardiology', 'nutrition') */
  specialty?: string;
}

/**
 * RAG Service interface.
 * Inject via token: RAG_SERVICE
 */
export interface IRagService {
  /**
   * Retrieve relevant context chunks for a user/query.
   *
   * @param userId - The user ID to retrieve context for
   * @param query - Optional search query (if not provided, uses general context)
   * @param options - Retrieval options (limit, minScore, specialty)
   * @returns Array of relevant context chunks
   */
  retrieve(
    userId: string,
    query?: string,
    options?: RagRetrieveOptions,
  ): Promise<RagChunk[]>;
}

/** Injection token for IRagService */
export const RAG_SERVICE = Symbol('RAG_SERVICE');
