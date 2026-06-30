import { getMongoDb } from "@/app/lib/mongodb";
import { RagChunk, RagHit, VectorStore } from "@/app/lib/server/rag/types";

const COLLECTION = "rag_chunks";
// Name of the Atlas Vector Search index, if one has been created in the cluster.
const VECTOR_INDEX = process.env.RAG_VECTOR_INDEX || "rag_vector_index";

type StoredChunk = {
  _id: string;
  namespace: string;
  documentId: string;
  ordinal: number;
  text: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
};

// In-memory fallback so RAG works when Mongo is unavailable (mirrors the
// existing study repo's degradation strategy).
const globalRagStore = global as typeof globalThis & {
  __ragMemoryStore?: Map<string, StoredChunk>;
  __ragVectorSearchSupported?: boolean | null;
};
const memoryStore =
  globalRagStore.__ragMemoryStore ||
  (globalRagStore.__ragMemoryStore = new Map<string, StoredChunk>());

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function toHit(chunk: StoredChunk, score: number): RagHit {
  return {
    id: chunk._id,
    documentId: chunk.documentId,
    ordinal: chunk.ordinal,
    text: chunk.text,
    score,
    vectorScore: score,
    metadata: chunk.metadata,
  };
}

async function ensureCollection() {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<StoredChunk>(COLLECTION);
}

export function createMongoVectorStore(): VectorStore {
  return {
    async supportsVectorSearch(): Promise<boolean> {
      if (typeof globalRagStore.__ragVectorSearchSupported === "boolean") {
        return globalRagStore.__ragVectorSearchSupported;
      }
      const col = await ensureCollection();
      if (!col) {
        globalRagStore.__ragVectorSearchSupported = false;
        return false;
      }
      try {
        // listSearchIndexes throws on clusters without Atlas Search; absence of
        // our named index also means we must use the cosine fallback.
        const cursor = (col as unknown as {
          listSearchIndexes?: () => { toArray: () => Promise<Array<{ name?: string }>> };
        }).listSearchIndexes?.();
        if (!cursor) {
          globalRagStore.__ragVectorSearchSupported = false;
          return false;
        }
        const indexes = await cursor.toArray();
        const has = indexes.some((i) => i?.name === VECTOR_INDEX);
        globalRagStore.__ragVectorSearchSupported = has;
        return has;
      } catch {
        globalRagStore.__ragVectorSearchSupported = false;
        return false;
      }
    },

    async upsertDocument(namespace, documentId, chunks): Promise<void> {
      const col = await ensureCollection();
      if (!col) {
        // Memory fallback: drop existing doc chunks, then insert.
        for (const [key, value] of memoryStore.entries()) {
          if (value.namespace === namespace && value.documentId === documentId) {
            memoryStore.delete(key);
          }
        }
        for (const chunk of chunks) {
          if (!chunk.embedding) continue;
          memoryStore.set(chunk.id, {
            _id: chunk.id,
            namespace,
            documentId,
            ordinal: chunk.ordinal,
            text: chunk.text,
            embedding: chunk.embedding,
            metadata: chunk.metadata,
          });
        }
        return;
      }

      await col.deleteMany({ namespace, documentId });
      const docs: StoredChunk[] = chunks
        .filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
        .map((c) => ({
          _id: c.id,
          namespace,
          documentId,
          ordinal: c.ordinal,
          text: c.text,
          embedding: c.embedding as number[],
          metadata: c.metadata,
        }));
      if (docs.length > 0) {
        await col.insertMany(docs, { ordered: false });
      }
    },

    async deleteDocument(namespace, documentId): Promise<void> {
      const col = await ensureCollection();
      if (!col) {
        for (const [key, value] of memoryStore.entries()) {
          if (value.namespace === namespace && value.documentId === documentId) {
            memoryStore.delete(key);
          }
        }
        return;
      }
      await col.deleteMany({ namespace, documentId });
    },

    async deleteNamespace(namespace): Promise<void> {
      const col = await ensureCollection();
      if (!col) {
        for (const [key, value] of memoryStore.entries()) {
          if (value.namespace === namespace) memoryStore.delete(key);
        }
        return;
      }
      await col.deleteMany({ namespace });
    },

    async listChunks(namespace): Promise<RagChunk[]> {
      const col = await ensureCollection();
      if (!col) {
        return Array.from(memoryStore.values())
          .filter((c) => c.namespace === namespace)
          .map((c) => ({
            id: c._id,
            namespace: c.namespace,
            documentId: c.documentId,
            ordinal: c.ordinal,
            text: c.text,
            embedding: c.embedding,
            metadata: c.metadata,
          }));
      }
      const rows = await col.find({ namespace }).toArray();
      return rows.map((c) => ({
        id: c._id,
        namespace: c.namespace,
        documentId: c.documentId,
        ordinal: c.ordinal,
        text: c.text,
        embedding: c.embedding,
        metadata: c.metadata,
      }));
    },

    async vectorSearch(namespace, queryEmbedding, topK): Promise<RagHit[]> {
      const col = await ensureCollection();

      // Memory fallback or no native index → cosine in app code.
      if (!col || !(await this.supportsVectorSearch())) {
        const chunks = await this.listChunks(namespace);
        return chunks
          .filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
          .map((c) => ({
            id: c.id,
            documentId: c.documentId,
            ordinal: c.ordinal,
            text: c.text,
            metadata: c.metadata,
            score: cosineSimilarity(queryEmbedding, c.embedding as number[]),
            vectorScore: cosineSimilarity(queryEmbedding, c.embedding as number[]),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK);
      }

      // Native Atlas Vector Search.
      try {
        const pipeline = [
          {
            $vectorSearch: {
              index: VECTOR_INDEX,
              path: "embedding",
              queryVector: queryEmbedding,
              numCandidates: Math.max(topK * 10, 100),
              limit: topK,
              filter: { namespace },
            },
          },
          {
            $project: {
              _id: 1,
              documentId: 1,
              ordinal: 1,
              text: 1,
              metadata: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ];
        const rows = (await col
          .aggregate(pipeline)
          .toArray()) as Array<StoredChunk & { score: number }>;
        return rows.map((r) =>
          toHit(r, typeof r.score === "number" ? r.score : 0),
        );
      } catch (error) {
        // If native search fails at runtime, degrade to cosine rather than error.
        console.error("rag.vectorSearch.native_failed", error);
        globalRagStore.__ragVectorSearchSupported = false;
        const chunks = await this.listChunks(namespace);
        return chunks
          .filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
          .map((c) => toHit(
            {
              _id: c.id,
              namespace,
              documentId: c.documentId,
              ordinal: c.ordinal,
              text: c.text,
              embedding: c.embedding as number[],
              metadata: c.metadata,
            },
            cosineSimilarity(queryEmbedding, c.embedding as number[]),
          ))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK);
      }
    },
  };
}
