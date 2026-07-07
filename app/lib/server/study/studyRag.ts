/**
 * Study-workspace adapter over the reusable RAG module.
 *
 * Centralizes the namespace convention (one RAG namespace per study session)
 * and exposes study-shaped helpers so the repo/routes never touch RAG internals.
 * All functions are best-effort: RAG is an enhancement layer, so failures here
 * must never break source upload, deletion, or the tutor.
 */

import {
  deleteDocument,
  deleteNamespace,
  indexDocument,
  IndexStatus,
  retrieve,
} from "@/app/lib/server/rag";
import { currentEmbedderId } from "@/app/lib/server/rag/embedders/gemini";

/** Re-exported so the repo's model-drift check has a single source of truth. */
export { currentEmbedderId };

function namespaceFor(sessionId: string): string {
  return `study-session:${sessionId}`;
}

/**
 * Durable per-source indexing status the repo persists so retrieval quality is
 * observable and recoverable:
 *   - "pending"      — queued/in-flight; embeddings not ready yet.
 *   - "indexed"      — vector + keyword retrieval ready.
 *   - "keyword_only" — stored without vectors (embed failed / no key); BM25 only.
 *   - "failed"       — the index attempt threw before storing anything.
 */
export type StudyIndexStatus = "pending" | "indexed" | "keyword_only" | "failed";

export interface StudyIndexOutcome {
  status: StudyIndexStatus;
  embedderId?: string;
}

function toStudyStatus(status: IndexStatus): StudyIndexStatus {
  // "empty" means no chunks were stored; treat it as indexed (nothing to embed)
  // so it isn't perpetually re-tried.
  if (status === "empty") return "indexed";
  return status;
}

/**
 * Index a single source's text for a session, in the background. Returns
 * immediately; the caller should NOT await this on the upload hot path. When an
 * `onStatus` callback is supplied it is invoked with the terminal outcome so the
 * caller can persist a durable status and later re-index if needed.
 */
export function indexStudySourceInBackground(
  sessionId: string,
  sourceId: string,
  text: string,
  sourceName?: string,
  onStatus?: (outcome: StudyIndexOutcome) => void | Promise<void>,
): void {
  // Fire-and-forget: keep upload latency unchanged. Errors are logged, not thrown.
  void indexDocument(namespaceFor(sessionId), sourceId, text, {
    metadata: sourceName ? { name: sourceName } : undefined,
  })
    .then((result) => {
      return onStatus?.({
        status: toStudyStatus(result.status),
        embedderId: result.embedderId,
      });
    })
    .catch(async (error) => {
      console.error("study.rag.index_failed", { sessionId, sourceId, error });
      try {
        await onStatus?.({ status: "failed" });
      } catch (statusError) {
        console.error("study.rag.index_status_persist_failed", {
          sessionId,
          sourceId,
          statusError,
        });
      }
    });
}

/**
 * Re-index a source that previously failed / stored keyword-only. Awaited (used
 * by the on-read staleness sweep, not the upload hot path). Returns the outcome
 * so the caller can persist the new status.
 */
export async function reindexStudySource(
  sessionId: string,
  sourceId: string,
  text: string,
  sourceName?: string,
): Promise<StudyIndexOutcome> {
  try {
    const result = await indexDocument(namespaceFor(sessionId), sourceId, text, {
      metadata: sourceName ? { name: sourceName } : undefined,
    });
    return {
      status: toStudyStatus(result.status),
      embedderId: result.embedderId,
    };
  } catch (error) {
    console.error("study.rag.reindex_failed", { sessionId, sourceId, error });
    return { status: "failed" };
  }
}

export async function removeStudySourceFromIndex(
  sessionId: string,
  sourceId: string,
): Promise<void> {
  try {
    await deleteDocument(namespaceFor(sessionId), sourceId);
  } catch (error) {
    console.error("study.rag.delete_source_failed", { sessionId, sourceId, error });
  }
}

export async function removeStudySessionFromIndex(
  sessionId: string,
): Promise<void> {
  try {
    await deleteNamespace(namespaceFor(sessionId));
  } catch (error) {
    console.error("study.rag.delete_session_failed", { sessionId, error });
  }
}

export interface StudyRetrievedChunk {
  /** Global chunk ordinal across the session's merged sources (citation id). */
  index: number;
  chunk: string;
  score: number;
  /**
   * Raw per-strategy scores (cosine similarity / BM25). Unlike the fused
   * `score` — which is positive by construction for every returned hit — these
   * say whether the chunk ACTUALLY matched the query, so callers can decide if
   * retrieval found anything relevant at all.
   */
  vectorScore?: number;
  keywordScore?: number;
}

/**
 * Hybrid retrieval for the tutor. Returns chunks in the same shape the tutor
 * route already uses ({ index, chunk, score }), where `index` is a stable
 * citation id. Falls back to keyword-only automatically when vectors aren't
 * ready, so behavior/latency stay stable right after upload. Each hit is
 * returned with its adjacent chunks so the model sees coherent windows, not
 * isolated fragments.
 */
export async function retrieveStudyContext(
  sessionId: string,
  query: string,
  topK: number,
): Promise<StudyRetrievedChunk[]> {
  const hits = await retrieve(namespaceFor(sessionId), query, {
    topK,
    expandNeighbors: 1,
  });
  // Assign a session-global running citation id. The per-document `ordinal`
  // resets to 0 for every source, so with ≥2 sources two different chunks both
  // became `[4]` — the model couldn't disambiguate them and the stored
  // citations array held duplicate, non-unique ids. A running index over the
  // (already relevance-ordered) result set gives every returned chunk a unique,
  // stable `[N]`.
  return hits.map((hit, position) => ({
    index: position + 1,
    chunk: hit.text,
    score: hit.score,
    vectorScore: hit.vectorScore,
    keywordScore: hit.keywordScore,
  }));
}
