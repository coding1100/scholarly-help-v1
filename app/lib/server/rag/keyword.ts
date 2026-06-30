import { RagChunk, RagHit } from "@/app/lib/server/rag/types";

/**
 * Lightweight BM25 keyword ranker over a set of chunks. Runs entirely in app
 * code (no DB text index required), which keeps it available everywhere —
 * including the in-memory fallback and the moment right after upload before
 * embeddings exist. This is the keyword half of the hybrid retriever.
 */

const K1 = 1.5;
const B = 0.75;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "as", "at",
  "by", "from", "what", "which", "who", "how", "why", "when", "do", "does",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function keywordSearch(
  chunks: RagChunk[],
  query: string,
  topK: number,
): RagHit[] {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0 || chunks.length === 0) return [];

  // Pre-tokenize the corpus.
  const docs = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    return { chunk, tokens, tf, length: tokens.length };
  });

  const totalDocs = docs.length;
  const avgLen =
    docs.reduce((sum, d) => sum + d.length, 0) / Math.max(totalDocs, 1);

  // Document frequency per query term.
  const df = new Map<string, number>();
  for (const term of queryTerms) {
    let count = 0;
    for (const d of docs) if (d.tf.has(term)) count += 1;
    df.set(term, count);
  }

  const scored = docs.map((d) => {
    let score = 0;
    for (const term of queryTerms) {
      const termFreq = d.tf.get(term);
      if (!termFreq) continue;
      const n = df.get(term) || 0;
      // BM25 idf with +1 smoothing to stay non-negative.
      const idf = Math.log(1 + (totalDocs - n + 0.5) / (n + 0.5));
      const denom =
        termFreq + K1 * (1 - B + (B * d.length) / Math.max(avgLen, 1));
      score += idf * ((termFreq * (K1 + 1)) / Math.max(denom, 1e-9));
    }
    return { chunk: d.chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({
      id: s.chunk.id,
      documentId: s.chunk.documentId,
      ordinal: s.chunk.ordinal,
      text: s.chunk.text,
      score: s.score,
      keywordScore: s.score,
      metadata: s.chunk.metadata,
    }));
}
