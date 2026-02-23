import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { IRagService, RagChunk, RagRetrieveOptions } from './rag.interface';
import { DocumentChunk } from './schemas/document-chunk.schema';
import { EMBEDDING_SERVICE, type IEmbeddingService } from './embedding';

const VECTOR_INDEX_NAME = 'vector_index';

/**
 * RAG Service using MongoDB Atlas Vector Search.
 * Embeds the query and runs $vectorSearch on documentchunks.embedding.
 */
@Injectable()
export class RagService implements IRagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectModel(DocumentChunk.name)
    private readonly chunkModel: Model<DocumentChunk>,
    @Inject(EMBEDDING_SERVICE)
    private readonly embeddingService: IEmbeddingService,
  ) {}

  async retrieve(userId: string, query?: string, options?: RagRetrieveOptions): Promise<RagChunk[]> {
    const limit = options?.limit ?? 5;
    const specialty = options?.specialty;
    const minScore = options?.minScore;

    this.logger.debug(
      `RAG retrieve: userId=${userId}, query="${query ?? 'none'}", limit=${limit}, specialty=${specialty ?? 'none'}`,
    );

    const searchText = (query?.trim()?.length ? query : 'general health context').trim();
    let embedding: number[];
    try {
      embedding = await this.embeddingService.embed(searchText);
    } catch (err) {
      this.logger.warn(`RAG embedding failed, skipping retrieval: ${err}`);
      return [];
    }

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (specialty) {
      filter.specialty = specialty;
    }

    const pipeline: PipelineStage[] = [
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: 'embedding',
          queryVector: embedding,
          numCandidates: Math.max(limit * 10, 100),
          limit,
          filter,
        },
      },
      {
        $project: {
          content: 1,
          source: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];
    if (typeof minScore === 'number' && minScore > 0) {
      pipeline.push({ $match: { score: { $gte: minScore } } });
    }

    const results = await this.chunkModel.aggregate(pipeline).exec();

    return results.map((r: { content: string; source?: string; score?: number }) => ({
      content: r.content,
      source: r.source,
      score: r.score,
    }));
  }
}
