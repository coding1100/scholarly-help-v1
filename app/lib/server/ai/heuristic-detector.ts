/**
 * Deterministic, explainable AI-writing heuristic.
 *
 * Pure and dependency-light so it can be unit-/script-tested without the Next route
 * or the Gemini call. It derives an AI-likelihood from the SAME signals the humanizer
 * is built to neutralize (shared rule set in ai-tells.const), so text the humanizer
 * has cleaned scores low here by construction. This is the fix for "AI score still
 * high right after humanizing": the scorer and the humanizer now speak the same language.
 */
import { BURSTINESS_STDDEV_FLOOR, countTells } from "./ai-tells.const";

export type SignalDirection = "ai" | "human";

export interface FiredSignal {
  id: string;
  label: string;
  direction: SignalDirection;
}

export interface HeuristicResult {
  aiPercent: number;
  confidence: number;
  firedSignals: FiredSignal[];
  details: {
    totalWords: number;
    avgSentenceWords: number;
    sentenceStdDev: number;
    ttr: number;
    longWordRatio: number;
    transitionCount: number;
    contentTellCount: number;
    matchedTells: string[];
  };
}

function clampPercent(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function clampConfidence(x: number): number {
  if (!Number.isFinite(x)) return 55;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function toWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) || [];
}

function splitIntoSentences(text: string): string[] {
  const s = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return s.length > 0 ? s : [text.trim()].filter(Boolean);
}

function stdDev(values: number[]): number {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, n) => acc + (n - mean) * (n - mean), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Evidence-anchored stylometric scorer.
 *
 * Each signal yields evidence in [-1, +1]: positive => more AI-like, negative =>
 * more human-like. Weights reflect detector importance (formal transitions and low
 * burstiness dominate). The final AI percent maps the weighted evidence onto 0-100
 * around a neutral 50, so "no evidence either way" stays neutral instead of the old
 * behavior of defaulting every passage to a hard-coded 50 and biasing high.
 */
export function scoreHeuristic(text: string): HeuristicResult {
  const words = toWords(text);
  const totalWords = words.length || 1;
  const uniqueWords = new Set(words).size;
  const ttr = uniqueWords / totalWords;

  const sentences = splitIntoSentences(text);
  const sentenceWordCounts = sentences.map((s) => toWords(s).length || 1);
  const avgSentenceWords =
    sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceWordCounts.length;
  const sentenceStdDev = stdDev(sentenceWordCounts);

  const longWordRatio = words.filter((w) => w.length >= 8).length / totalWords;
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  const firstPerson = (text.match(/\b(i|me|my|mine|we|our|ours|us)\b/gi) || []).length;

  // Shared tell counting (same list the humanizer removes).
  const tells = countTells(text);
  const transitionDensity = (tells.transitions / totalWords) * 1000; // per 1k words
  const contentTellDensity = (tells.contentTells / totalWords) * 1000;

  const signals: { id: string; label: string; weight: number; value: number }[] = [];

  // Burstiness: at/below the shared floor is a strong tell; well above is human-like.
  signals.push({
    id: "burstiness",
    label: "Sentence-length variation",
    weight: 2.4,
    value:
      sentenceStdDev <= BURSTINESS_STDDEV_FLOOR
        ? 1
        : sentenceStdDev >= BURSTINESS_STDDEV_FLOOR * 2
          ? -1
          : -((sentenceStdDev - BURSTINESS_STDDEV_FLOOR) / BURSTINESS_STDDEV_FLOOR),
  });

  // Formal transitions: any is suspicious; density scales it.
  signals.push({
    id: "transitions",
    label: "Formal transition words",
    weight: 2.2,
    value: transitionDensity <= 0 ? -0.5 : Math.min(1, transitionDensity / 8),
  });

  // Content AI-tell vocabulary (delve, robust, ...).
  signals.push({
    id: "content_tells",
    label: "AI-tell vocabulary",
    weight: 1.4,
    value: contentTellDensity <= 0 ? -0.3 : Math.min(1, contentTellDensity / 6),
  });

  // Vocabulary diversity.
  signals.push({
    id: "ttr",
    label: "Vocabulary diversity",
    weight: 1.0,
    value: ttr < 0.44 ? 0.8 : ttr > 0.65 ? -0.8 : (0.55 - ttr) / 0.11,
  });

  // Uniform mid-length sentences (classic AI cadence).
  signals.push({
    id: "avg_len",
    label: "Average sentence length",
    weight: 0.6,
    value: avgSentenceWords >= 16 && avgSentenceWords <= 34 ? 0.7 : -0.2,
  });

  // Dense long words read more machine-formal.
  signals.push({
    id: "long_words",
    label: "Long-word density",
    weight: 0.5,
    value: longWordRatio > 0.24 ? 0.7 : -0.1,
  });

  // Human markers the humanizer keeps: contractions and first person push human-ward.
  signals.push({
    id: "contractions",
    label: "Contractions",
    weight: 0.8,
    value: contractions / totalWords > 0.012 ? -1 : 0.1,
  });
  signals.push({
    id: "first_person",
    label: "First-person voice",
    weight: 0.9,
    value: firstPerson / totalWords > 0.01 ? -1 : 0.1,
  });

  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const weighted = signals.reduce((a, s) => a + s.weight * s.value, 0) / totalWeight;
  // Map weighted evidence [-1, 1] onto [0, 100] around a neutral 50.
  const score = 50 + weighted * 50;

  // Confidence scales with text length AND with how much evidence actually fired
  // (a passage with no strong signals shouldn't be reported with high certainty).
  let lengthConfidence = 78;
  if (totalWords < 50) lengthConfidence = 30;
  else if (totalWords < 120) lengthConfidence = 45;
  else if (totalWords < 220) lengthConfidence = 60;
  const evidenceStrength = Math.min(1, Math.abs(weighted) * 1.8);
  const confidence = lengthConfidence * (0.6 + 0.4 * evidenceStrength);

  return {
    aiPercent: clampPercent(score),
    confidence: clampConfidence(confidence),
    firedSignals: signals
      .filter((s) => Math.abs(s.value) > 0.25)
      .map((s) => ({
        id: s.id,
        label: s.label,
        direction: s.value > 0 ? ("ai" as const) : ("human" as const),
      })),
    details: {
      totalWords,
      avgSentenceWords,
      sentenceStdDev,
      ttr,
      longWordRatio,
      transitionCount: tells.transitions,
      contentTellCount: tells.contentTells,
      matchedTells: tells.matched,
    },
  };
}
