import { Embedder } from "@/app/lib/server/rag/types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
// text-embedding-004 was shut down 2026-01-14 and now 404s. gemini-embedding-001
// is also scheduled for shutdown (2026-07-14), so we default to the current
// recommended model, gemini-embedding-2. Override with GEMINI_EMBED_MODEL.
const DEFAULT_EMBED_MODEL = "gemini-embedding-2";
// gemini-embedding-2 outputs 3072-dim vectors by default, but supports
// Matryoshka scaling: we request 768 dims (via outputDimensionality) to stay
// compatible with the existing vector store / Atlas index and keep costs down.
const EMBED_DIMENSIONS = 768;
// Gemini's batchEmbedContents accepts up to 100 requests; stay under to be safe.
const MAX_BATCH = 96;

type BatchEmbedResponse = {
  embeddings?: Array<{ values?: number[] }>;
};

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured for embeddings.");
  }
  return key;
}

function getModel(): string {
  return process.env.GEMINI_EMBED_MODEL || DEFAULT_EMBED_MODEL;
}

/**
 * The stable embedder id for the currently-configured model. Stored alongside
 * vectors so callers can detect model drift (and re-index) when the embedding
 * model changes. Single source of truth — do not hardcode this elsewhere.
 */
export function currentEmbedderId(): string {
  return `gemini:${getModel()}`;
}

async function embedBatchOnce(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[][]> {
  const apiKey = getApiKey();
  const model = getModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(
      `${GEMINI_API_BASE}/models/${model}:batchEmbedContents?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          requests: texts.map((text) => ({
            model: `models/${model}`,
            content: { parts: [{ text }] },
            taskType,
            // Scale the (default 3072-dim) output down to our store's dimension.
            outputDimensionality: EMBED_DIMENSIONS,
          })),
        }),
      },
    );
    if (!res.ok) {
      const raw = await res.text();
      throw new Error(
        `Gemini embeddings error (${res.status}): ${raw.slice(0, 200)}`,
      );
    }
    const payload = (await res.json()) as BatchEmbedResponse;
    const vectors = (payload.embeddings || []).map((e) => e.values || []);
    if (vectors.length !== texts.length) {
      throw new Error(
        `Gemini embeddings count mismatch: got ${vectors.length}, expected ${texts.length}`,
      );
    }
    return vectors;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini embeddings request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function embedBatchWithRetry(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
  retries = 2,
): Promise<number[][]> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await embedBatchOnce(texts, taskType);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Gemini embedding provider. Documents are embedded with RETRIEVAL_DOCUMENT and
 * queries with RETRIEVAL_QUERY (the model is asymmetric — using the right task
 * type meaningfully improves retrieval quality).
 */
export function createGeminiEmbedder(): Embedder {
  return {
    id: currentEmbedderId(),
    dimensions: EMBED_DIMENSIONS,
    async embed(texts: string[]): Promise<number[][]> {
      return embedDocuments(texts);
    },
  };
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embedInBatches(texts, "RETRIEVAL_DOCUMENT");
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedInBatches([text], "RETRIEVAL_QUERY");
  return vector;
}

async function embedInBatches(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const batch = texts.slice(i, i + MAX_BATCH);
    const vectors = await embedBatchWithRetry(batch, taskType);
    out.push(...vectors);
  }
  return out;
}

export const GEMINI_EMBED_DIMENSIONS = EMBED_DIMENSIONS;
