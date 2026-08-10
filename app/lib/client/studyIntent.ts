import { StudyArtifactType, StudyLearningMode } from "@/app/utils/studyApiClient";

export type StudyChatIntent =
  | { type: "none" }
  | { type: "explain_simple" }
  | { type: "exam_notes"; artifact: "notes" }
  | { type: "exam_summary"; artifact: "summary" }
  | { type: "generate_quiz"; artifact: "quizzes" }
  | { type: "generate_questions"; artifact: "quizzes" | "flashcards" };

export function detectStudyChatIntent(message: string): StudyChatIntent {
  const m = message.toLowerCase().trim();
  if (!m) return { type: "none" };

  if (
    /exam[- ]?focus|exam notes|for my exam|for the test|study guide|what matters for the exam|high[- ]?yield/.test(
      m,
    )
  ) {
    return { type: "exam_notes", artifact: "notes" };
  }

  if (
    /hardest|difficult|confus|explain.*bullet|simple terms|in plain english|break down/.test(
      m,
    )
  ) {
    return { type: "explain_simple" };
  }

  if (/quiz|practice test|multiple choice|mcq/.test(m)) {
    return { type: "generate_quiz", artifact: "quizzes" };
  }

  if (/question(s)? from|generate question|research question/.test(m)) {
    return { type: "generate_questions", artifact: "quizzes" };
  }

  if (/flashcard/.test(m)) {
    return { type: "generate_questions", artifact: "flashcards" };
  }

  return { type: "none" };
}

export function intentSuggestedMode(intent: StudyChatIntent): StudyLearningMode | null {
  if (intent.type === "exam_notes" || intent.type === "exam_summary") return "exam";
  if (intent.type === "generate_quiz" || intent.type === "generate_questions") return "quiz";
  if (intent.type === "explain_simple") return "research";
  return null;
}

export function intentTargetTab(
  intent: StudyChatIntent,
): Exclude<StudyArtifactType, "outline" | "syllabus"> | null {
  if (intent.type === "exam_notes") return "notes";
  if (intent.type === "exam_summary") return "summary";
  if (intent.type === "generate_quiz") return "quizzes";
  if (intent.type === "generate_questions" && intent.artifact === "flashcards") {
    return "flashcards";
  }
  if (intent.type === "generate_questions") return "quizzes";
  return null;
}
