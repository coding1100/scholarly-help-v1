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
import {
  generateGeminiText,
  GeminiConfigError,
} from "@/app/lib/server/ai/gemini";

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

/**
 * A fresh integer sampler seed for EVERY generation call. Gemini is
 * near-deterministic on structured JSON even at temperature > 0, so a text
 * "variation seed" alone is a weak lever — passing a DIFFERENT numeric seed to
 * `generationConfig.seed` is what actually makes the sampler take a different
 * path. First generations get a fresh seed too: users perceive "same document →
 * byte-identical summary, even in a new session" as a bug, not stability.
 */
function samplingSeed(): number {
  // Cryptographically-unnecessary; just needs to differ per click and fit in a
  // 32-bit signed int (Gemini rejects out-of-range seeds).
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/**
 * Distinct framing lenses rotated across regenerations. Telling the model to
 * simply "be different" is weak; anchoring it to a concrete, different ORGANIZING
 * PRINCIPLE each time forces real structural variation. Picked at random so
 * consecutive regenerations rarely repeat a lens.
 */
const REGENERATION_LENSES = [
  "Organize it around the KEY QUESTIONS a student would ask about this material, answering each.",
  "Organize it as a CAUSE-AND-EFFECT / how-it-works walkthrough of the core processes.",
  "Organize it by COMPARING AND CONTRASTING the main concepts, terms, or approaches.",
  "Organize it from FOUNDATIONS → ADVANCED, building each idea on the previous one.",
  "Organize it around COMMON MISCONCEPTIONS and what's actually true, with the correct explanation.",
  "Organize it by REAL-WORLD RELEVANCE: for each idea, lead with why it matters and where it applies.",
  "Organize it as a set of THEMED CLUSTERS you derive from the content, different from an obvious outline.",
];

function pickRegenerationLens(): string {
  const index = Math.floor(Math.random() * REGENERATION_LENSES.length);
  return REGENERATION_LENSES[index];
}

// How much of the previous artifact to show the model as a "don't repeat this"
// reference. Enough to fingerprint it, small enough not to crowd the prompt.
const PREVIOUS_CONTENT_CHAR_CAP = 3000;

/**
 * On "Regenerate", the strongest lever for real variation is showing the model
 * the exact output the user rejected and demanding a substantially different
 * version — a random seed alone only nudges wording. Returns "" on first
 * generation (no previous artifact).
 */
function serializePrevious(previousContent: unknown): string {
  if (previousContent === undefined || previousContent === null) return "";
  try {
    const serialized =
      typeof previousContent === "string"
        ? previousContent
        : JSON.stringify(previousContent);
    return serialized && serialized.trim() ? serialized : "";
  } catch {
    return "";
  }
}

function avoidPreviousBlock(
  previousContent: unknown,
  options: { lens?: string; insist?: boolean } = {},
): string {
  const serialized = serializePrevious(previousContent);
  if (!serialized) return "";
  const clipped = serialized.slice(0, PREVIOUS_CONTENT_CHAR_CAP);
  const lens = options.lens ?? pickRegenerationLens();
  return [
    "",
    "REGENERATION REQUEST — the user saw the version below and asked for a NEW one.",
    options.insist
      ? "Your PREVIOUS attempt was too similar to it and was REJECTED. This time you MUST change the structure and wording substantially — do not repeat yourself."
      : "Your output MUST be substantially different from it while staying accurate to the source:",
    `- NEW ANGLE FOR THIS VERSION: ${lens}`,
    "- Use a different structure/organization and different headings or groupings than the previous version.",
    "- Reword everything; do not reuse its sentences or bullet phrasings.",
    "- Shift emphasis: cover angles, details, or examples the previous version skipped;",
    "  drop or shorten what it dwelled on.",
    "Do NOT copy from it. PREVIOUS VERSION (for reference only):",
    clipped,
  ].join("\n");
}

/**
 * How close two generations may be before we treat the "new" one as a failed
 * regeneration. Jaccard similarity over word 3-grams (shingles) is robust to
 * light reordering/paraphrase while still catching near-verbatim repeats.
 */
const REGENERATION_MAX_SIMILARITY = 0.6;

function shingleSet(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const shingles = new Set<string>();
  for (let i = 0; i + 2 < words.length; i += 1) {
    shingles.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  // Fall back to single words for very short texts so similarity is still defined.
  if (shingles.size === 0) words.forEach((w) => shingles.add(w));
  return shingles;
}

/** Jaccard similarity (0..1) of two texts' word-trigram sets. */
function textSimilarity(a: string, b: string): number {
  const setA = shingleSet(a);
  const setB = shingleSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const shingle of setA) if (setB.has(shingle)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * True when `candidate` is too close to `previousContent` to count as a genuine
 * regeneration. Only meaningful when there IS a previous version.
 */
function isTooSimilarToPrevious(
  candidate: unknown,
  previousContent: unknown,
): boolean {
  const prev = serializePrevious(previousContent);
  const next = serializePrevious(candidate);
  if (!prev || !next) return false;
  return textSimilarity(prev, next) >= REGENERATION_MAX_SIMILARITY;
}

/** Regeneration runs hotter so sampling itself also diversifies the output. */
function generationTemperature(base: number, isRegeneration: boolean): number {
  return isRegeneration ? Math.min(0.95, base + 0.3) : base;
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

/**
 * Runs a single generation and, when regenerating, enforces that the result is
 * genuinely different from the previous artifact. Each builder supplies a
 * `run(attempt)` that produces + parses one candidate; `attempt` carries the
 * escalating levers (a fresh sampler seed, a rotating framing lens, a hotter
 * temperature, and an "insist" flag that hardens the avoid-previous wording).
 *
 * On first generation (no previous content) it runs exactly once. On a
 * regeneration whose output is still too similar, it retries ONCE with the
 * escalated attempt — a bounded backstop so the user never sees byte-identical
 * output, without unbounded retry loops or extra cost in the common case.
 */
export type RegenAttempt = {
  seed?: number;
  lens: string;
  temperature: number;
  topP: number;
  insist: boolean;
};

async function generateWithRegenerationRetry<T>(
  previousContent: unknown,
  baseTemperature: number,
  run: (attempt: RegenAttempt) => Promise<T>,
): Promise<T> {
  const isRegeneration = serializePrevious(previousContent) !== "";
  const lens = pickRegenerationLens();
  const first: RegenAttempt = {
    seed: samplingSeed(),
    lens,
    temperature: generationTemperature(baseTemperature, isRegeneration),
    topP: isRegeneration ? 0.95 : 0.9,
    insist: false,
  };
  const retry: RegenAttempt = {
    // A brand-new seed and a different lens so the retry doesn't retrace the
    // first attempt's path.
    seed: samplingSeed(),
    lens: pickRegenerationLens(),
    temperature: Math.min(0.98, first.temperature + 0.15),
    topP: 1,
    insist: true,
  };

  // A single attempt can fail for reasons the HTTP-level retry can't fix
  // (e.g. malformed JSON that slipped past response constraints). One more
  // attempt with a fresh seed usually recovers; only then bubble the error up
  // to the caller's degraded fallback.
  let firstResult: T;
  try {
    firstResult = await run(first);
  } catch (error) {
    console.error("study.generate.first_attempt_failed_retrying", error);
    return run(retry);
  }
  if (!isRegeneration || !isTooSimilarToPrevious(firstResult, previousContent)) {
    return firstResult;
  }

  console.warn("study.regenerate.too_similar_retrying");
  let retryResult: T;
  try {
    retryResult = await run(retry);
  } catch (error) {
    // The first attempt succeeded but was too similar; a failed escalation
    // should not throw away a usable result.
    console.error("study.regenerate.retry_failed_keeping_first", error);
    return firstResult;
  }
  // Keep whichever attempt diverged more from the previous version.
  if (isTooSimilarToPrevious(retryResult, previousContent)) {
    const prev = serializePrevious(previousContent);
    const firstSim = textSimilarity(prev, serializePrevious(firstResult));
    const retrySim = textSimilarity(prev, serializePrevious(retryResult));
    return retrySim <= firstSim ? retryResult : firstResult;
  }
  return retryResult;
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

async function buildSummary(
  sourceText: string,
  mode: StudyLearningMode,
  previousContent?: unknown,
) {
  // Length scales with the ORIGINAL source so the % ratio + word floor reflect
  // what the student actually uploaded (unchanged behavior).
  const { target } = summaryTargetWordCount(countWords(sourceText));
  const maxOutputTokens = summaryOutputTokenBudget(target);
  const normalized = sourceText.trim();

  // Single-pass (small docs) and reduce-fallback both synthesize the final
  // summary from a body of text; only the input differs. Regeneration variation
  // (seed + lens + temperature + similarity-retry) is enforced on that final
  // synthesizing call via generateWithRegenerationRetry.
  const synthesize = (body: string) =>
    generateWithRegenerationRetry(
      previousContent,
      0.45,
      async (attempt) => {
        const raw = await generateGeminiText({
          systemInstruction: summarySystemInstruction(mode),
          userPrompt:
            summaryUserPrompt(body, mode, target) +
            variationHint() +
            avoidPreviousBlock(previousContent, {
              lens: attempt.lens,
              insist: attempt.insist,
            }),
          temperature: attempt.temperature,
          topP: attempt.topP,
          seed: attempt.seed,
          maxOutputTokens,
          responseJson: true,
        });
        return parseJson<{ short: string; detailed: string }>(raw);
      },
    );

  // Small documents: a single pass already sees everything.
  if (normalized.length <= SUMMARY_SINGLE_PASS_CHAR_LIMIT) {
    return synthesize(normalized);
  }

  // Large documents: MAP each chunk into compact notes (parallel, batched), then
  // REDUCE all notes into the final summary — so it reflects the WHOLE document.
  const chunks = chunkText(normalized, MAP_CHUNK_CHARS);
  const notes = await mapWithConcurrency(chunks, MAP_CONCURRENCY, async (chunk, i) => {
    try {
      const note = await generateGeminiText({
        systemInstruction: mapChunkSystemInstruction(),
        userPrompt: mapChunkUserPrompt(chunk, i + 1, chunks.length) + variationHint(),
        temperature: 0.4,
        maxOutputTokens: 700,
      });
      return note.trim();
    } catch (error) {
      console.error("study.summary.map_chunk_failed", { index: i, error });
      return ""; // a failed chunk is skipped, not fatal.
    }
  });

  // Drop chunks that were pure front-matter/ToC (the map step flags these) so the
  // reduce step never sees "1. Introduction 2 1.1 Rationale…" style noise.
  const aggregatedNotes = notes
    .map((n) => n.trim())
    .filter((n) => n && !/^\(no substantive content\)$/i.test(n))
    .join("\n\n");
  if (!aggregatedNotes) {
    // Every map call failed — fall back to a single pass over a prioritized slice.
    return synthesize(prepareSource(sourceText, mode, []));
  }

  // Reduce: fold the per-chunk notes into the final summary. Same synthesizing
  // contract as the single pass, only the "SOURCE TEXT:" label differs, so we
  // reuse the retry helper directly with the reduce prompt.
  return generateWithRegenerationRetry(
    previousContent,
    0.45,
    async (attempt) => {
      const raw = await generateGeminiText({
        systemInstruction: summarySystemInstruction(mode),
        userPrompt:
          reduceSummaryUserPrompt(aggregatedNotes, mode, target) +
          variationHint() +
          avoidPreviousBlock(previousContent, {
            lens: attempt.lens,
            insist: attempt.insist,
          }),
        temperature: attempt.temperature,
        topP: attempt.topP,
        seed: attempt.seed,
        maxOutputTokens,
        responseJson: true,
      });
      return parseJson<{ short: string; detailed: string }>(raw);
    },
  );
}

async function buildNotes(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
  previousContent?: unknown,
) {
  const prepared = prepareSource(sourceText, mode, examTopics);
  return generateWithRegenerationRetry(previousContent, 0.5, async (attempt) => {
    const raw = await generateGeminiText({
      systemInstruction: notesSystemInstruction(mode),
      userPrompt:
        notesUserPrompt(prepared, mode, examTopics) +
        variationHint() +
        avoidPreviousBlock(previousContent, {
          lens: attempt.lens,
          insist: attempt.insist,
        }),
      temperature: attempt.temperature,
      topP: attempt.topP,
      seed: attempt.seed,
      maxOutputTokens: 4096,
      responseJson: true,
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
  });
}

async function buildFlashcards(
  sourceText: string,
  mode: StudyLearningMode,
  previousContent?: unknown,
) {
  const prepared = prepareSource(sourceText, mode, []);
  return generateWithRegenerationRetry(previousContent, 0.5, async (attempt) => {
    const raw = await generateGeminiText({
      systemInstruction: flashcardsSystemInstruction(),
      userPrompt:
        flashcardsUserPrompt(prepared, mode) +
        variationHint() +
        avoidPreviousBlock(previousContent, {
          lens: attempt.lens,
          insist: attempt.insist,
        }),
      temperature: attempt.temperature,
      topP: attempt.topP,
      seed: attempt.seed,
      maxOutputTokens: 4096,
      responseJson: true,
    });
    const cards = parseJson<Array<{ id: string; front: string; back: string }>>(raw);
    return cards.map((card, index) => ({
      id: card.id || `card-${index + 1}`,
      front: String(card.front || "").trim(),
      back: String(card.back || "").trim(),
    }));
  });
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
  previousContent?: unknown,
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
  return generateWithRegenerationRetry(previousContent, 0.55, async (attempt) => {
    const raw = await generateGeminiText({
      systemInstruction: quizSystemInstruction(),
      userPrompt:
        quizUserPrompt(prepared, mode, examTopics, targetQuestions) +
        variationHint() +
        avoidPreviousBlock(previousContent, {
          lens: attempt.lens,
          insist: attempt.insist,
        }),
      temperature: attempt.temperature,
      topP: attempt.topP,
      seed: attempt.seed,
      maxOutputTokens: quizOutputTokenBudget(targetQuestions),
      responseJson: true,
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
  });
}

export interface GeneratedArtifact {
  content: unknown;
  /**
   * True when the LLM could not be reached/parsed and the content is the
   * deterministic offline extract instead of a real AI artifact. The route
   * forwards this so the UI can warn the user rather than presenting the stub
   * as a genuine AI result (which made outages look like "the AI always
   * returns the same summary").
   */
  degraded: boolean;
}

export async function generateArtifact(
  type: StudyArtifactType,
  sourceText: string,
  options: GenerateArtifactOptions = {},
): Promise<GeneratedArtifact> {
  const mode = resolveMode(options.mode);
  const examTopics = (options.examTopics || []).map((t) => t.trim()).filter(Boolean);

  const previousContent = options.previousContent;

  try {
    switch (type) {
      case "summary":
        return {
          content: await buildSummary(sourceText, mode, previousContent),
          degraded: false,
        };
      case "notes":
        return {
          content: await buildNotes(sourceText, mode, examTopics, previousContent),
          degraded: false,
        };
      case "flashcards":
        return {
          content: await buildFlashcards(sourceText, mode, previousContent),
          degraded: false,
        };
      case "quizzes":
        return {
          content: await buildQuiz(sourceText, mode, examTopics, previousContent),
          degraded: false,
        };
      default:
        return { content: { message: "Unsupported generation type." }, degraded: false };
    }
  } catch (error) {
    console.error("study.generateArtifact.llm", error);
    // A misconfigured/rejected API key is a PERMANENT server error, not a
    // transient blip. Falling back to the deterministic sentence-slicer here is
    // exactly what made a broken deploy look like a working feature that just
    // "always returns the same summary". Re-throw so the route returns a real
    // 5xx the user can see, instead of silently serving an offline stub.
    if (error instanceof GeminiConfigError) {
      throw error;
    }
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
        content: {
          short: fallbackSentences.slice(0, 2).join(" "),
          detailed: detailParts.join("\n"),
        },
        degraded: true,
      };
    }
    if (type === "notes") {
      return {
        content: {
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
        },
        degraded: true,
      };
    }
    if (type === "flashcards") {
      return {
        content: [
          {
            id: "card-1",
            front: "What is the main idea in your uploaded source?",
            back:
              fallbackSentences[0] ||
              "Upload richer source text to generate stronger flashcards.",
          },
        ],
        degraded: true,
      };
    }
    if (type === "quizzes") {
      return {
        content: [
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
        ],
        degraded: true,
      };
    }
    return { content: { message: "Unsupported generation type." }, degraded: true };
  }
}
