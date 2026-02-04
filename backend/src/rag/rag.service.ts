import { Injectable, Logger } from '@nestjs/common';
import { IRagService, RagChunk, RagRetrieveOptions } from './rag.interface';

/**
 * Stub RAG Service implementation.
 *
 * Returns empty results for now. Future implementations:
 * - MongoDB Vector Search
 * - Pinecone
 * - OpenSearch with vector capabilities
 *
 * When implementing real retrieval:
 * 1. Embed the query using an embedding model
 * 2. Search vector store for similar chunks
 * 3. Return top-k results with scores
 */
@Injectable()
export class RagService implements IRagService {
  private readonly logger = new Logger(RagService.name);

  async retrieve(
    userId: string,
    query?: string,
    options?: RagRetrieveOptions,
  ): Promise<RagChunk[]> {
    const limit = options?.limit ?? 5;
    const specialty = options?.specialty;

    this.logger.debug(
      `RAG retrieve: userId=${userId}, query="${query || 'none'}", limit=${limit}, specialty=${specialty || 'none'}`,
    );

    // Stub: return empty array
    // TODO: Implement actual vector search when needed
    // Example MongoDB Vector Search implementation:
    //
    // const embedding = await this.embeddingService.embed(query);
    // const results = await this.documentsCollection.aggregate([
    //   {
    //     $vectorSearch: {
    //       index: 'vector_index',
    //       path: 'embedding',
    //       queryVector: embedding,
    //       numCandidates: limit * 10,
    //       limit: limit,
    //       filter: { userId: new ObjectId(userId) },
    //     },
    //   },
    //   { $project: { content: 1, source: 1, score: { $meta: 'vectorSearchScore' } } },
    // ]).toArray();
    //
    // return results.map(r => ({
    //   content: r.content,
    //   source: r.source,
    //   score: r.score,
    // }));

    return [];
  }
}
