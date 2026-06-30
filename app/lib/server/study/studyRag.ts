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
  retrieve,
} from "@/app/lib/server/rag";

function namespaceFor(sessionId: string): string {
  return `study-session:${sessionId}`;
}

/**
 * Index a single source's text for a session, in the background. Returns
 * immediately; the caller should NOT await this on the upload hot path.
 */
export function indexStudySourceInBackground(
  sessionId: string,
  sourceId: string,
  text: string,
  sourceName?: string,
): void {
  // Fire-and-forget: keep upload latency unchanged. Errors are logged, not thrown.
  void indexDocument(namespaceFor(sessionId), sourceId, text, {
    metadata: sourceName ? { name: sourceName } : undefined,
  }).catch((error) => {
    console.error("study.rag.index_failed", { sessionId, sourceId, error });
  });
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
}

/**
 * Hybrid retrieval for the tutor. Returns chunks in the same shape the tutor
 * route already uses ({ index, chunk, score }), where `index` is a stable
 * citation id. Falls back to keyword-only automatically when vectors aren't
 * ready, so behavior/latency stay stable right after upload.
 */
export async function retrieveStudyContext(
  sessionId: string,
  query: string,
  topK: number,
): Promise<StudyRetrievedChunk[]> {
  const hits = await retrieve(namespaceFor(sessionId), query, { topK });
  return hits.map((hit) => ({
    // Cite by ordinal within the document; unique + stable for a single source,
    // and matches the prior "chunk index" citation semantics closely enough.
    index: hit.ordinal,
    chunk: hit.text,
    score: hit.score,
  }));
}
