"use client";

/**
 * Per-topic quiz mastery tracking, persisted per-device via localStorage.
 * Adapted from the previously-unused tutorExperience.ts (same EMA-based
 * scoring algorithm) — this is genuine practice history, not a value that
 * needs cross-device sync, so localStorage (the same pattern already used by
 * app/utilities/api.ts's tutor workspace) is the right store, not a new
 * backend schema.
 */

export interface TutorTopicMastery {
  topic: string;
  mastery: number;
  attempts: number;
  correct: number;
  skipped: number;
  hintsUsed: number;
  updatedAt: string;
}

export interface TutorMasterySnapshot {
  overall: number;
  topics: Record<string, TutorTopicMastery>;
  questionsAnswered: number;
  sessionsCompleted: number;
  lastSessionAt?: string;
}

export interface TutorQuizResultItem {
  topic: string;
  correct: boolean;
  skipped: boolean;
  usedHint: boolean;
}

export const EMPTY_TUTOR_MASTERY: TutorMasterySnapshot = {
  overall: 0,
  topics: {},
  questionsAnswered: 0,
  sessionsCompleted: 0,
};

const MASTERY_STORAGE_PREFIX = "sh_tutor_mastery_v1:";

function storageKey(sessionId: string): string {
  return `${MASTERY_STORAGE_PREFIX}${sessionId}`;
}

export function parseTutorMastery(raw: string | null): TutorMasterySnapshot {
  if (!raw) return EMPTY_TUTOR_MASTERY;
  try {
    const parsed = JSON.parse(raw) as Partial<TutorMasterySnapshot>;
    return {
      ...EMPTY_TUTOR_MASTERY,
      ...parsed,
      topics: parsed.topics || {},
    };
  } catch {
    return EMPTY_TUTOR_MASTERY;
  }
}

export function loadTutorMastery(sessionId: string): TutorMasterySnapshot {
  if (typeof window === "undefined") return EMPTY_TUTOR_MASTERY;
  try {
    return parseTutorMastery(window.localStorage.getItem(storageKey(sessionId)));
  } catch {
    return EMPTY_TUTOR_MASTERY;
  }
}

function saveTutorMastery(sessionId: string, snapshot: TutorMasterySnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(sessionId), JSON.stringify(snapshot));
  } catch {
    // Storage unavailable/full — mastery tracking degrades silently, never
    // breaks the quiz flow itself.
  }
}

export function updateTutorMastery(
  current: TutorMasterySnapshot,
  results: TutorQuizResultItem[],
): TutorMasterySnapshot {
  const topics = { ...current.topics };
  for (const result of results) {
    const topic = result.topic.trim() || "General";
    const previous = topics[topic] || {
      topic,
      mastery: 0,
      attempts: 0,
      correct: 0,
      skipped: 0,
      hintsUsed: 0,
      updatedAt: new Date().toISOString(),
    };
    const evidence = result.skipped ? 20 : result.correct ? (result.usedHint ? 75 : 100) : 35;
    const weight = Math.min(0.45, 1 / Math.max(2, previous.attempts + 1));
    topics[topic] = {
      ...previous,
      mastery: Math.round(previous.attempts === 0 ? evidence : previous.mastery * (1 - weight) + evidence * weight),
      attempts: previous.attempts + 1,
      correct: previous.correct + (result.correct ? 1 : 0),
      skipped: previous.skipped + (result.skipped ? 1 : 0),
      hintsUsed: previous.hintsUsed + (result.usedHint ? 1 : 0),
      updatedAt: new Date().toISOString(),
    };
  }
  const values = Object.values(topics);
  const overall = values.length
    ? Math.round(values.reduce((sum, item) => sum + item.mastery, 0) / values.length)
    : 0;
  return {
    overall,
    topics,
    questionsAnswered:
      current.questionsAnswered + results.filter((item) => !item.skipped).length,
    sessionsCompleted: current.sessionsCompleted + 1,
    lastSessionAt: new Date().toISOString(),
  };
}

/** Load, apply a completed quiz round's results, persist, and return the new snapshot. */
export function recordTutorQuizResults(
  sessionId: string,
  results: TutorQuizResultItem[],
): TutorMasterySnapshot {
  const next = updateTutorMastery(loadTutorMastery(sessionId), results);
  saveTutorMastery(sessionId, next);
  return next;
}

/** Topics below this mastery score are surfaced as "weak spots". */
const WEAK_TOPIC_THRESHOLD = 60;

export function weakTopics(snapshot: TutorMasterySnapshot): TutorTopicMastery[] {
  return Object.values(snapshot.topics)
    .filter((t) => t.attempts > 0 && t.mastery < WEAK_TOPIC_THRESHOLD)
    .sort((a, b) => a.mastery - b.mastery);
}
