import {
  countWords,
  splitSentences,
  summaryTargetWordCount,
} from "@/app/lib/server/study/text";
import {
  flashcardsSystemInstruction,
  flashcardsUserPrompt,
  notesSystemInstruction,
  notesUserPrompt,
  quizSystemInstruction,
  quizUserPrompt,
  summarySystemInstruction,
  summaryUserPrompt,
} from "@/app/lib/server/study/prompts";
import { prioritizeSourceText } from "@/app/lib/server/study/sourcePriority";
import {
  GenerateArtifactOptions,
  StudyArtifactType,
  StudyLearningMode,
} from "@/app/lib/server/study/types";
import { generateGeminiText } from "@/app/lib/server/ai/gemini";

function extractJsonBlock(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return raw.trim();
}

function parseJson<T>(raw: string): T {
  return JSON.parse(extractJsonBlock(raw)) as T;
}

function resolveMode(mode?: StudyLearningMode): StudyLearningMode {
  return mode === "exam" || mode === "quiz" || mode === "research" ? mode : "research";
}

function prepareSource(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
): string {
  return prioritizeSourceText(sourceText, mode, examTopics);
}

async function buildSummary(sourceText: string, mode: StudyLearningMode) {
  const prepared = prepareSource(sourceText, mode, []);
  // Scale length to the ORIGINAL source, not the prioritized/truncated slice, so
  // the ratio reflects what the student actually uploaded.
  const { target } = summaryTargetWordCount(countWords(sourceText));
  // ~1.4 tokens per word, plus headroom for Markdown/JSON syntax. Clamp so a
  // huge source can still produce its (capped) 5% summary without overrunning.
  const maxOutputTokens = Math.min(8192, Math.max(700, Math.round(target * 2) + 400));
  const raw = await generateGeminiText({
    systemInstruction: summarySystemInstruction(mode),
    userPrompt: summaryUserPrompt(prepared, mode, target),
    temperature: 0.3,
    maxOutputTokens,
  });
  return parseJson<{ short: string; detailed: string }>(raw);
}

async function buildNotes(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
) {
  const prepared = prepareSource(sourceText, mode, examTopics);
  const raw = await generateGeminiText({
    systemInstruction: notesSystemInstruction(mode),
    userPrompt: notesUserPrompt(prepared, mode, examTopics),
    temperature: 0.35,
    maxOutputTokens: 4096,
  });
  return parseJson<{
    title: string;
    mode?: string;
    examTips?: string[];
    sections: Array<{
      heading: string;
      priority?: string;
      bullets: string[];
    }>;
  }>(raw);
}

async function buildFlashcards(sourceText: string, mode: StudyLearningMode) {
  const prepared = prepareSource(sourceText, mode, []);
  const raw = await generateGeminiText({
    systemInstruction: flashcardsSystemInstruction(),
    userPrompt: flashcardsUserPrompt(prepared, mode),
    temperature: 0.35,
    maxOutputTokens: 4096,
  });
  const cards = parseJson<Array<{ id: string; front: string; back: string }>>(raw);
  return cards.map((card, index) => ({
    id: card.id || `card-${index + 1}`,
    front: String(card.front || "").trim(),
    back: String(card.back || "").trim(),
  }));
}

async function buildQuiz(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
) {
  const prepared = prepareSource(sourceText, mode, examTopics);
  const raw = await generateGeminiText({
    systemInstruction: quizSystemInstruction(),
    userPrompt: quizUserPrompt(prepared, mode, examTopics),
    temperature: 0.4,
    maxOutputTokens: 4096,
  });
  const quizzes = parseJson<
    Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
      difficulty?: string;
      questionType?: string;
    }>
  >(raw);
  return quizzes.map((quiz, index) => ({
    id: quiz.id || `quiz-${index + 1}`,
    question: String(quiz.question || "").trim(),
    options:
      Array.isArray(quiz.options) && quiz.options.length === 4
        ? quiz.options.map((option) => String(option))
        : [
            "Option A",
            "Option B",
            "Option C",
            "Option D",
          ],
    correctAnswerIndex:
      typeof quiz.correctAnswerIndex === "number" &&
      quiz.correctAnswerIndex >= 0 &&
      quiz.correctAnswerIndex <= 3
        ? quiz.correctAnswerIndex
        : 0,
    explanation: String(quiz.explanation || "").trim(),
    difficulty: quiz.difficulty || "medium",
    questionType: quiz.questionType || "recall",
  }));
}

export async function generateArtifact(
  type: StudyArtifactType,
  sourceText: string,
  options: GenerateArtifactOptions = {},
) {
  const mode = resolveMode(options.mode);
  const examTopics = (options.examTopics || []).map((t) => t.trim()).filter(Boolean);

  try {
    switch (type) {
      case "summary":
        return await buildSummary(sourceText, mode);
      case "notes":
        return await buildNotes(sourceText, mode, examTopics);
      case "flashcards":
        return await buildFlashcards(sourceText, mode);
      case "quizzes":
        return await buildQuiz(sourceText, mode, examTopics);
      default:
        return { message: "Unsupported generation type." };
    }
  } catch (error) {
    console.error("study.generateArtifact.llm", error);
    const prioritized = prepareSource(sourceText, mode, examTopics);
    const fallbackSentences = splitSentences(prioritized);
    if (type === "summary") {
      // Keep the fallback formatted (headings + bullets) so the UI still renders
      // a prettified summary even when the LLM call fails.
      const keyPoints = fallbackSentences.slice(0, 6);
      const detailParts = [
        "## Overview",
        fallbackSentences.slice(0, 2).join(" ") || "Summary unavailable.",
      ];
      if (keyPoints.length > 0) {
        detailParts.push(
          "",
          "## Key Points",
          ...keyPoints.map((sentence) => `- ${sentence}`),
        );
      }
      return {
        short: fallbackSentences.slice(0, 2).join(" "),
        detailed: detailParts.join("\n"),
      };
    }
    if (type === "notes") {
      return {
        title: mode === "exam" ? "Exam Study Guide" : "Study Notes",
        mode,
        examTips:
          mode === "exam"
            ? ["Review headings and repeated terms in your source.", "Focus on definitions marked as important."]
            : undefined,
        sections: [
          { heading: "Key Ideas", priority: "must-know", bullets: fallbackSentences.slice(0, 6) },
          { heading: "Details to Review", bullets: fallbackSentences.slice(6, 12) },
        ].filter((section) => section.bullets.length > 0),
      };
    }
    if (type === "flashcards") {
      return [
        {
          id: "card-1",
          front: "What is the main idea in your uploaded source?",
          back:
            fallbackSentences[0] ||
            "Upload richer source text to generate stronger flashcards.",
        },
      ];
    }
    if (type === "quizzes") {
      return [
        {
          id: "quiz-1",
          question: "Which statement best reflects your source?",
          options: [
            fallbackSentences[0] || "Not enough source text.",
            "A statement that contradicts the source.",
            "An unrelated fact.",
            "None of the above.",
          ],
          correctAnswerIndex: 0,
          explanation: "This matches your uploaded source material.",
          difficulty: "easy",
          questionType: "recall",
        },
      ];
    }
    return { message: "Unsupported generation type." };
  }
}
