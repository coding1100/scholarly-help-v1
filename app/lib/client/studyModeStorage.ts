import { StudyLearningMode } from "@/app/utils/studyApiClient";

const MODE_KEY = "sh_study_learning_mode_v1";

export function getStoredStudyMode(sessionId: string | null): StudyLearningMode {
  if (typeof window === "undefined" || !sessionId) return "research";
  try {
    const raw = localStorage.getItem(`${MODE_KEY}_${sessionId}`);
    if (raw === "exam" || raw === "quiz" || raw === "research") return raw;
  } catch {
    // ignore
  }
  return "research";
}

export function setStoredStudyMode(sessionId: string, mode: StudyLearningMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${MODE_KEY}_${sessionId}`, mode);
  } catch {
    // ignore
  }
}

export function getStoredExamTopics(sessionId: string | null): string[] {
  if (typeof window === "undefined" || !sessionId) return [];
  try {
    const raw = localStorage.getItem(`sh_exam_topics_${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t) => String(t).trim()).filter(Boolean).slice(0, 12);
  } catch {
    return [];
  }
}

export function setStoredExamTopics(sessionId: string, topics: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`sh_exam_topics_${sessionId}`, JSON.stringify(topics.slice(0, 12)));
  } catch {
    // ignore
  }
}
