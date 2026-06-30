/**
 * Reusable hybrid RAG — shared types.
 *
 * The module is intentionally generic: callers index documents under a
 * `namespace` (a logical collection, e.g. "study-session:<id>") and later
 * retrieve the most relevant chunks for a query. Nothing here is study-specific,
 * so other features can reuse it by choosing their own namespace.
 */

/** A unit of text stored and retrieved by the RAG layer. */
export interface RagChunk {
  /** Stable id, unique within a namespace. */
  id: string;
  /** Logical collection this chunk belongs to (e.g. a session id). */
  namespace: string;
  /** The source document this chunk came from (for delete/replace). */
  documentId: string;
  /** 0-based position of the chunk within its document. */
  ordinal: number;
  /** The chunk text. */
  text: string;
  /** Embedding vector; absent until indexing completes. */
  embedding?: number[];
  /** Arbitrary caller metadata (e.g. source name). */
  metadata?: Record<string, unknown>;
}

/** A retrieval hit with its fused relevance score. */
export interface RagHit {
  id: string;
  documentId: string;
  ordinal: number;
  text: string;
  /** Final fused score (higher = more relevant). */
  score: number;
  /** Per-strategy diagnostics, useful for tuning/debugging. */
  vectorScore?: number;
  keywordScore?: number;
  metadata?: Record<string, unknown>;
}

export interface RetrieveOptions {
  /** Max hits to return. Default 6. */
  topK?: number;
  /**
   * Blend between vector and keyword ranking via Reciprocal Rank Fusion.
   * Pure code-level fusion, so this only affects fusion weighting, not whether
   * a strategy runs. Default balanced.
   */
  vectorWeight?: number;
  keywordWeight?: number;
  /**
   * If embeddings/vector search are unavailable (not yet indexed, no API key,
   * provider error), fall back to keyword-only retrieval instead of throwing.
   * Default true — this is what keeps response time/behavior stable.
   */
  keywordFallback?: boolean;
}

/** Pluggable embedding provider — swap Gemini for a local model later. */
export interface Embedder {
  /** Stable identifier (stored alongside vectors to detect model drift). */
  readonly id: string;
  /** Vector dimensionality this provider produces. */
  readonly dimensions: number;
  /** Embed a batch of texts. Returns one vector per input, in order. */
  embed(texts: string[]): Promise<number[][]>;
}

/** Pluggable vector store backend. */
export interface VectorStore {
  /** Replace all chunks for a document within a namespace (idempotent). */
  upsertDocument(
    namespace: string,
    documentId: string,
    chunks: RagChunk[],
  ): Promise<void>;
  /** Remove a document's chunks. */
  deleteDocument(namespace: string, documentId: string): Promise<void>;
  /** Remove an entire namespace. */
  deleteNamespace(namespace: string): Promise<void>;
  /** Vector similarity search. Returns hits with a raw vector score. */
  vectorSearch(
    namespace: string,
    queryEmbedding: number[],
    topK: number,
  ): Promise<RagHit[]>;
  /** Fetch all chunks for a namespace (used for keyword scoring + fallback). */
  listChunks(namespace: string): Promise<RagChunk[]>;
  /** Whether native vector search ($vectorSearch) is usable in this deployment. */
  supportsVectorSearch(): Promise<boolean>;
}
