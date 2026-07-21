/**
 * Response contract of POST /tools/ai-detect (backend DetectionEngineService).
 * Keep in sync with scholarlyhelp/src/modules/tools/ai-detector — the backend is
 * the source of truth; the frontend performs no scoring of its own.
 */

export type SegmentLabel = "human" | "mixed" | "ai" | "neutral";

export interface DetectSegment {
  text: string;
  start: number;
  end: number;
  label: SegmentLabel;
  prob_ai: number;
  reasons: string[];
}

export interface DetectionResponse {
  status: "success";
  verdict: {
    ai_percent: number;
    human_percent: number;
    band: [number, number];
    confidence: number;
    label: SegmentLabel;
  };
  breakdown: { ai: number; mixed: number; human: number };
  segments?: DetectSegment[];
  signals?: {
    fired: { id: string; label: string; direction: "ai" | "human" }[];
    matched_tells: string[];
    burstiness: number;
  };
  trust: {
    trustworthy: boolean;
    paraphrase_suspected: boolean;
    evasion_chars_found: boolean;
    reason: string;
  };
  meta: {
    engine_version: string;
    model_version: string;
    degraded: boolean;
    arbiter_used: boolean;
    arbiter_reason: string;
    words: number;
    truncated: boolean;
    /** Backend flag: input short enough that the score is materially weaker. */
    low_confidence?: boolean;
    /** User-facing caveat from the backend, '' when there is nothing to warn about. */
    warning?: string;
    latency_ms: number;
    tokens_used: number;
  };
}

/** A segment plus the client-side editing state layered on top of it. */
export interface EditableSegment extends DetectSegment {
  /** User replaced the text (manual rewrite or auto-replace) — label is stale. */
  edited: boolean;
  /** User asserted this is their own writing. */
  ignored: boolean;
}

export const MIN_DETECT_WORDS = 50;
/**
 * Below this the score is returned but flagged as less reliable — the backend
 * sets `meta.low_confidence` at the same threshold (LOW_CONFIDENCE_WORDS in
 * detection-engine.service.ts); keep the two in sync.
 */
export const LOW_CONFIDENCE_WORDS = 100;
export const MAX_DETECT_WORDS = 1500;
