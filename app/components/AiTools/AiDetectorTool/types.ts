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
    /** @deprecated Use ai_likelihood_percent when present. */
    ai_percent: number;
    /** @deprecated Use human_likelihood_percent when present. */
    human_percent: number;
    ai_likelihood_percent?: number;
    human_likelihood_percent?: number;
    ai_content_share_percent?: number;
    human_content_share_percent?: number;
    metric_version?: string;
    primary_metric?: "document_likelihood" | "ai_content_share";
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
    signals_agree?: boolean;
    disagreement_percent?: number;
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

export interface DetectorPublicConfig {
  minimum_words: number;
  low_confidence_words: number;
  maximum_words: number;
  metric_version: string;
}

export const MIN_DETECT_WORDS = 100;
/**
 * Below this the score is returned but flagged as less reliable — the backend
 * sets `meta.low_confidence` at the same threshold (LOW_CONFIDENCE_WORDS in
 * detection-engine.service.ts); keep the two in sync.
 */
export const LOW_CONFIDENCE_WORDS = 180;
export const MAX_DETECT_WORDS = 1500;

export const FALLBACK_DETECTOR_CONFIG: DetectorPublicConfig = {
  minimum_words: MIN_DETECT_WORDS,
  low_confidence_words: LOW_CONFIDENCE_WORDS,
  maximum_words: MAX_DETECT_WORDS,
  metric_version: "2.0",
};

/** Backward-compatible selectors for a rolling backend/frontend deployment. */
export function detectorLikelihood(result: DetectionResponse): number {
  return result.verdict.ai_likelihood_percent ?? result.verdict.ai_percent;
}

export function detectorHumanLikelihood(result: DetectionResponse): number {
  return (
    result.verdict.human_likelihood_percent ?? result.verdict.human_percent
  );
}

export function detectorContentShare(result: DetectionResponse): number {
  return (
    result.verdict.ai_content_share_percent ??
    Math.round(result.breakdown.ai + result.breakdown.mixed * 0.5)
  );
}

const percent = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

/** Runtime boundary for model output: clamps probabilities and drops invalid segments. */
export function normalizeDetectionResponse(result: DetectionResponse): DetectionResponse {
  return {
    ...result,
    verdict: {
      ...result.verdict,
      ai_percent: percent(result.verdict.ai_percent), human_percent: percent(result.verdict.human_percent),
      ai_likelihood_percent: result.verdict.ai_likelihood_percent === undefined ? undefined : percent(result.verdict.ai_likelihood_percent),
      human_likelihood_percent: result.verdict.human_likelihood_percent === undefined ? undefined : percent(result.verdict.human_likelihood_percent),
      confidence: Math.min(1, Math.max(0, result.verdict.confidence || 0)),
    },
    breakdown: { ai: percent(result.breakdown.ai), mixed: percent(result.breakdown.mixed), human: percent(result.breakdown.human) },
    segments: result.segments?.filter((segment) => typeof segment.text === "string" && Number.isFinite(segment.start) && Number.isFinite(segment.end)).map((segment) => ({ ...segment, prob_ai: Math.min(1, Math.max(0, segment.prob_ai || 0)) })),
  };
}

export function detectorHumanContentShare(result: DetectionResponse): number {
  return (
    result.verdict.human_content_share_percent ??
    100 - detectorContentShare(result)
  );
}

/** The visible gauge follows content composition, never the internal diagnostic. */
export function detectorPrimaryScore(result: DetectionResponse): number {
  return detectorContentShare(result);
}

export function detectorDisagreement(result: DetectionResponse): number {
  return (
    result.trust.disagreement_percent ??
    Math.abs(detectorLikelihood(result) - detectorContentShare(result))
  );
}
