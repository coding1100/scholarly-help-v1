import {
  chunkText,
  countWords,
  quizTargetQuestionCount,
  splitSentences,
  summaryTargetWordCount,
} from "@/app/lib/server/study/text";
import {
  flashcardsSystemInstruction,
  flashcardsUserPrompt,
  mapChunkSystemInstruction,
  mapChunkUserPrompt,
  notesSystemInstruction,
  notesUserPrompt,
  quizSystemInstruction,
  quizUserPrompt,
  reduceSummaryUserPrompt,
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

/**
 * A short, unique directive appended to generation prompts so that pressing
 * "Regenerate" yields genuinely different content instead of a near-identical
 * repeat. Each call gets a fresh nonce; the model is told to vary its angle and
 * wording from any previous attempt. (Kept terse so it doesn't skew output.)
 */
function variationHint(): string {
  const nonce =
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return [
    "",
    `Variation seed: ${nonce}.`,
    "If you have generated for this source before, produce a fresh take: vary the",
    "wording, ordering, examples, and (where reasonable) which points you emphasize,",
    "while staying accurate to the SOURCE TEXT.",
  ].join("\n");
}

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

// Above this many characters, a single LLM call can't see the whole document,
// so we switch to map-reduce. Below it, one pass is cheaper and just as good.
const SUMMARY_SINGLE_PASS_CHAR_LIMIT = 12000;
// Each map chunk is large to minimize the number of LLM calls (fewer, bigger
// reads) while still fitting comfortably in context.
const MAP_CHUNK_CHARS = 6000;
// Run map calls in parallel, but in bounded batches so a huge doc doesn't fire
// hundreds of simultaneous requests (rate limits / memory).
const MAP_CONCURRENCY = 6;

function summaryOutputTokenBudget(target: number): number {
  // ~1.4 tokens per word, plus headroom for Markdown/JSON syntax. Clamp so a
  // huge source can still produce its (capped) summary without overrunning.
  return Math.min(8192, Math.max(700, Math.round(target * 2) + 400));
}

/** Run async tasks with a bounded concurrency, preserving input order. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await task(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

async function buildSummary(sourceText: string, mode: StudyLearningMode) {
  // Length scales with the ORIGINAL source so the % ratio + word floor reflect
  // what the student actually uploaded (unchanged behavior).
  const { target } = summaryTargetWordCount(countWords(sourceText));
  const maxOutputTokens = summaryOutputTokenBudget(target);
  const normalized = sourceText.trim();

  // Small documents: a single pass already sees everything.
  if (normalized.length <= SUMMARY_SINGLE_PASS_CHAR_LIMIT) {
    const raw = await generateGeminiText({
      systemInstruction: summarySystemInstruction(mode),
      userPrompt: summaryUserPrompt(normalized, mode, target) + variationHint(),
      temperature: 0.45,
      maxOutputTokens,
    });
    return parseJson<{ short: string; detailed: string }>(raw);
  }

  // Large documents: MAP each chunk into compact notes (parallel, batched), then
  // REDUCE all notes into the final summary — so it reflects the WHOLE document.
  const chunks = chunkText(normalized, MAP_CHUNK_CHARS);
  const notes = await mapWithConcurrency(chunks, MAP_CONCURRENCY, async (chunk, i) => {
    try {
      const note = await generateGeminiText({
        systemInstruction: mapChunkSystemInstruction(),
        userPrompt: mapChunkUserPrompt(chunk, i + 1, chunks.length),
        temperature: 0.2,
        maxOutputTokens: 700,
      });
      return note.trim();
    } catch (error) {
      console.error("study.summary.map_chunk_failed", { index: i, error });
      return ""; // a failed chunk is skipped, not fatal.
    }
  });

  const aggregatedNotes = notes.filter(Boolean).join("\n\n");
  if (!aggregatedNotes) {
    // Every map call failed — fall back to a single pass over a prioritized slice.
    const prepared = prepareSource(sourceText, mode, []);
    const raw = await generateGeminiText({
      systemInstruction: summarySystemInstruction(mode),
      userPrompt: summaryUserPrompt(prepared, mode, target) + variationHint(),
      temperature: 0.45,
      maxOutputTokens,
    });
    return parseJson<{ short: string; detailed: string }>(raw);
  }

  const raw = await generateGeminiText({
    systemInstruction: summarySystemInstruction(mode),
    userPrompt:
      reduceSummaryUserPrompt(aggregatedNotes, mode, target) + variationHint(),
    temperature: 0.45,
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
    userPrompt: notesUserPrompt(prepared, mode, examTopics) + variationHint(),
    temperature: 0.5,
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
    userPrompt: flashcardsUserPrompt(prepared, mode) + variationHint(),
    temperature: 0.5,
    maxOutputTokens: 4096,
  });
  const cards = parseJson<Array<{ id: string; front: string; back: string }>>(raw);
  return cards.map((card, index) => ({
    id: card.id || `card-${index + 1}`,
    front: String(card.front || "").trim(),
    back: String(card.back || "").trim(),
  }));
}

function quizOutputTokenBudget(targetQuestions: number): number {
  // ~180 tokens per MCQ item (question + 4 options + explanation + JSON syntax),
  // plus headroom. Clamp so large quizzes aren't truncated mid-array.
  return Math.min(16384, Math.max(4096, Math.round(targetQuestions * 220) + 600));
}

async function buildQuiz(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
) {
  // Quiz size scales to ~20% of the source (min 10 questions). Scale off the
  // ORIGINAL source length so the ratio reflects what the student uploaded, not
  // the prioritized slice we actually send to the model.
  const { target: targetQuestions } = quizTargetQuestionCount(
    countWords(sourceText),
  );
  // Give the model enough of the MOST-RELEVANT source to write that many
  // distinct questions: ~900 chars of prioritized content per target question,
  // bounded so a huge source stays within a sane context/token budget.
  const quizCharCap = Math.min(
    60000,
    Math.max(16000, targetQuestions * 900),
  );
  const prepared = prioritizeSourceText(sourceText, mode, examTopics, {
    charCap: quizCharCap,
    // Allow more ranked chunks through for large quizzes (each ~650 chars).
    chunkLimit: Math.max(24, Math.ceil(quizCharCap / 650)),
  });
  const raw = await generateGeminiText({
    systemInstruction: quizSystemInstruction(),
    userPrompt:
      quizUserPrompt(prepared, mode, examTopics, targetQuestions) +
      variationHint(),
    temperature: 0.55,
    maxOutputTokens: quizOutputTokenBudget(targetQuestions),
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
  // Drop malformed/blank and near-duplicate questions before re-id'ing so the
  // final quiz is clean and (with the min floor honored by the prompt) usable.
  const seen = new Set<string>();
  const cleaned = quizzes
    .map((quiz) => ({
      question: String(quiz.question || "").trim(),
      options:
        Array.isArray(quiz.options) && quiz.options.length === 4
          ? quiz.options.map((option) => String(option))
          : ["Option A", "Option B", "Option C", "Option D"],
      correctAnswerIndex:
        typeof quiz.correctAnswerIndex === "number" &&
        quiz.correctAnswerIndex >= 0 &&
        quiz.correctAnswerIndex <= 3
          ? quiz.correctAnswerIndex
          : 0,
      explanation: String(quiz.explanation || "").trim(),
      difficulty: quiz.difficulty || "medium",
      questionType: quiz.questionType || "recall",
    }))
    .filter((quiz) => {
      if (!quiz.question) return false;
      const key = quiz.question.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return cleaned.map((quiz, index) => ({ id: `quiz-${index + 1}`, ...quiz }));
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
      // Keep the fallback formatted (headings + CATEGORIZED bullets) so the UI
      // still renders a prettified summary even when the LLM call fails. Key
      // Points are split into simple categorized sub-sections to match the
      // normal (LLM) output contract.
      const keyPoints = fallbackSentences.slice(0, 6);
      const detailParts = [
        "## Overview",
        fallbackSentences.slice(0, 2).join(" ") || "Summary unavailable.",
      ];
      if (keyPoints.length > 0) {
        detailParts.push("", "## Key Points");
        const primary = keyPoints.slice(0, Math.ceil(keyPoints.length / 2));
        const secondary = keyPoints.slice(Math.ceil(keyPoints.length / 2));
        detailParts.push(
          "### Main Ideas",
          ...primary.map((sentence) => `- ${sentence}`),
        );
        if (secondary.length > 0) {
          detailParts.push(
            "",
            "### Supporting Details",
            ...secondary.map((sentence) => `- ${sentence}`),
          );
        }
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
