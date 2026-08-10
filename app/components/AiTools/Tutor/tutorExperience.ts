import { StudyLearningMode } from "@/app/utils/studyApiClient";

export type TutorMode = "research" | "quiz" | "exam" | "assignment";
export type TutorAcademicDepth = "high_school" | "college" | "phd";
export type TutorExamFormat = "mcq" | "short_answer" | "mixed";
export type TutorDifficulty = "easy" | "medium" | "hard" | "adaptive";
export type TutorTiming = "soon" | "plenty";

export interface TutorPreferences {
  academicLevel: TutorAcademicDepth;
  mode: TutorMode;
  examFormat: TutorExamFormat;
  difficulty: TutorDifficulty;
  timing: TutorTiming;
  rubric: string;
}

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

export const DEFAULT_TUTOR_PREFERENCES: TutorPreferences = {
  academicLevel: "college",
  mode: "research",
  examFormat: "mcq",
  difficulty: "adaptive",
  timing: "plenty",
  rubric: "",
};

export const EMPTY_TUTOR_MASTERY: TutorMasterySnapshot = {
  overall: 0,
  topics: {},
  questionsAnswered: 0,
  sessionsCompleted: 0,
};

export function studyModeForTutor(mode: TutorMode): StudyLearningMode {
  if (mode === "exam") return "exam";
  if (mode === "quiz") return "quiz";
  return "research";
}

export function tutorPreferenceContext(preferences: TutorPreferences): string {
  const level = preferences.academicLevel.replace("_", " ");
  const format = preferences.examFormat.replace("_", " ");
  return [
    `Teach at ${level} level.`,
    preferences.mode === "assignment"
      ? "The student is working on an assignment. Give rubric-aware feedback and label any grade as an estimate."
      : "",
    preferences.mode === "exam" || preferences.mode === "quiz"
      ? `Match ${format} assessment style at ${preferences.difficulty} difficulty.`
      : "",
    preferences.timing === "soon"
      ? "The exam is soon: prioritize the smallest set of high-yield ideas and common traps."
      : "",
    preferences.rubric.trim()
      ? `Instructor or rubric preferences: ${preferences.rubric.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function parseTutorPreferences(raw: string | null): TutorPreferences {
  if (!raw) return DEFAULT_TUTOR_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as Partial<TutorPreferences>;
    return { ...DEFAULT_TUTOR_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_TUTOR_PREFERENCES;
  }
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
