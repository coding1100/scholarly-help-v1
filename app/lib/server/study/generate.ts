import {
  chunkText,
  countWords,
  quizTargetQuestionCount,
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
 * Extract only the human-visible prose from an artifact for similarity scoring.
 * Comparing `JSON.stringify(...)` would count the structural keys ("heading",
 * "question", "options", "id":"card-1"…) — identical across every generation —
 * inflating the trigram overlap and firing false "too similar" retries (and
 * poisoning the divergence tiebreak). We join only the content fields.
 */
function extractComparableText(content: unknown): string {
  if (content === undefined || content === null) return "";
  if (typeof content === "string") return content;

  const parts: string[] = [];
  const visit = (value: unknown, key?: string): void => {
    if (value === null || value === undefined) return;
    if (typeof value === "string") {
      // Skip synthetic ids (card-1, quiz-3…) — they never carry meaning and are
      // byte-identical across generations.
      if (key === "id") return;
      parts.push(value);
      return;
    }
    if (typeof value === "number" || typeof value === "boolean") return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item));
      return;
    }
    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        visit(v, k);
      }
    }
  };
  visit(content);
  return parts.join(" ");
}

/**
 * True when `candidate` is too close to `previousContent` to count as a genuine
 * regeneration. Only meaningful when there IS a previous version.
 */
function isTooSimilarToPrevious(
  candidate: unknown,
  previousContent: unknown,
): boolean {
  const prev = extractComparableText(previousContent);
  const next = extractComparableText(candidate);
  if (!prev || !next) return false;
  return textSimilarity(prev, next) >= REGENERATION_MAX_SIMILARITY;
}

/** Regeneration runs hotter so sampling itself also diversifies the output. */
function generationTemperature(base: number, isRegeneration: boolean): number {
  return isRegeneration ? Math.min(0.95, base + 0.3) : base;
}

/**
 * Locate the outermost JSON value in a possibly-noisy model response. With
 * `responseJson: true` the whole body is usually valid JSON, but a stray leading
 * token ("Here is your summary: {…}"), a code fence, or a truncated tail
 * (finishReason MAX_TOKENS) would otherwise make JSON.parse throw and fail the
 * whole generation. We try, in order:
 *   1. the raw trimmed body,
 *   2. the first fenced ```json block,
 *   3. the outermost {…} / […] slice.
 * The first candidate that parses wins. Throws only if none parse.
 */
function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  const candidates: string[] = [trimmed];

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  // Outermost object/array slice — recovers JSON embedded in prose.
  const firstObj = trimmed.indexOf("{");
  const lastObj = trimmed.lastIndexOf("}");
  if (firstObj !== -1 && lastObj > firstObj) {
    candidates.push(trimmed.slice(firstObj, lastObj + 1));
  }
  const firstArr = trimmed.indexOf("[");
  const lastArr = trimmed.lastIndexOf("]");
  if (firstArr !== -1 && lastArr > firstArr) {
    candidates.push(trimmed.slice(firstArr, lastArr + 1));
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  // Nothing parsed — surface the (least-noisy) body so the caller's catch/retry
  // engages deliberately instead of shipping a malformed value.
  throw new SyntaxError("Model response did not contain valid JSON");
}

function parseJson<T>(raw: string): T {
  return JSON.parse(extractJsonBlock(raw)) as T;
}

/**
 * Validate the parsed artifact has the shape the UI expects. A model returning
 * `{"summary": "..."}` instead of `{short, detailed}` would otherwise flow to
 * the DB and UI as `undefined` fields. Throwing here makes the retry path
 * engage just like a parse failure (and, if both attempts fail, surfaces a real
 * error to the user rather than a broken artifact).
 */
function assertShape(ok: boolean, label: string): void {
  if (!ok) {
    throw new SyntaxError(`Model response has an unexpected shape for ${label}`);
  }
}

function resolveMode(mode?: StudyLearningMode): StudyLearningMode {
  return mode === "exam" || mode === "quiz" || mode === "research" ? mode : "research";
}

/**
 * Source text is user-uploaded and untrusted. It is concatenated into prompts,
 * so a document containing "Ignore all previous instructions…" or a planted
 * ```json {…} ``` block could hijack the model or (with fenced-block extraction)
 * feed attacker-controlled JSON straight to the parser. We neutralize the two
 * highest-leverage vectors here, at the one choke point every builder passes
 * through: strip triple-backtick fences so no source block can masquerade as the
 * model's own JSON output, and defang the most common instruction-override
 * phrasings. This is defense-in-depth, not a full jailbreak filter — the prompts
 * also frame source as data-only.
 */
function sanitizeSourceText(sourceText: string): string {
  return (sourceText || "")
    // Collapse code fences to plain markers; keeps the content, removes the
    // fence semantics that let a source plant a parseable ```json block.
    .replace(/```+/g, "'''")
    // Defang the classic override preambles (case-insensitive, line-anchored).
    .replace(
      /(^|\n)\s*(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context)/gi,
      "$1[removed instruction-like text]",
    )
    .replace(
      /(^|\n)\s*system\s*:/gi,
      "$1(source text)",
    );
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
  // The summary JSON holds BOTH a `short` and a full `detailed` markdown body,
  // and JSON escaping (\n\n, headings, quotes) inflates the token count well
  // beyond a naive words×tokens estimate. Undersizing this truncates the
  // response mid-object (finishReason MAX_TOKENS) → unparseable JSON. Budget
  // generously (~3 tokens/word + large fixed headroom) with a high floor and a
  // higher ceiling so realistic summaries complete.
  return Math.min(12000, Math.max(2048, Math.round(target * 3) + 1200));
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
  // Retry tuned to RECOVER FROM MALFORMED/EMPTY JSON: keep temperature and topP
  // moderate. A hotter, wider distribution makes truncated/invalid JSON MORE
  // likely — the opposite of what a parse-failure retry needs.
  const repairRetry: RegenAttempt = {
    seed: samplingSeed(),
    lens: pickRegenerationLens(),
    temperature: Math.min(0.6, baseTemperature),
    topP: 0.9,
    insist: false,
  };
  // Retry tuned to FORCE DIVERGENCE when a regeneration came back too similar:
  // a fresh seed, a different lens, and a hotter sample so the output actually
  // moves. topP stays moderate (0.9) — pushing it to 1.0 noticeably raises the
  // odds of truncated/invalid JSON, which made the retry throw and silently fall
  // back to the too-similar first result (the "regeneration gave identical
  // output" bug). Temperature does the diversifying; a valid parse matters more.
  const divergeRetry: RegenAttempt = {
    seed: samplingSeed(),
    lens: pickRegenerationLens(),
    temperature: Math.min(0.9, first.temperature + 0.15),
    topP: 0.9,
    insist: true,
  };

  // A single attempt can fail for reasons the HTTP-level retry can't fix
  // (e.g. malformed JSON that slipped past response constraints). One more
  // attempt with a fresh seed (at a SAFE, JSON-friendly temperature) usually
  // recovers; if it still fails, the error propagates so the route returns a
  // real error to the user (there is no offline stub).
  let firstResult: T;
  try {
    firstResult = await run(first);
  } catch (error) {
    console.error("study.generate.first_attempt_failed_retrying", error);
    return run(repairRetry);
  }
  if (!isRegeneration || !isTooSimilarToPrevious(firstResult, previousContent)) {
    return firstResult;
  }

  console.warn("study.regenerate.too_similar_retrying");
  let retryResult: T;
  try {
    retryResult = await run(divergeRetry);
  } catch (error) {
    // The first attempt succeeded but was too similar; a failed escalation
    // should not throw away a usable result.
    console.error("study.regenerate.retry_failed_keeping_first", error);
    return firstResult;
  }
  // Keep whichever attempt diverged more from the previous version.
  if (isTooSimilarToPrevious(retryResult, previousContent)) {
    const prev = extractComparableText(previousContent);
    const firstSim = textSimilarity(prev, extractComparableText(firstResult));
    const retrySim = textSimilarity(prev, extractComparableText(retryResult));
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
        const parsed = parseJson<{ short: string; detailed: string }>(raw);
        assertShape(
          typeof parsed?.short === "string" &&
            typeof parsed?.detailed === "string" &&
            parsed.detailed.trim().length > 0,
          "summary",
        );
        return parsed;
      },
    );

  // Small documents: a single pass already sees everything.
  if (normalized.length <= SUMMARY_SINGLE_PASS_CHAR_LIMIT) {
    return synthesize(normalized);
  }

  // Large documents: MAP each chunk into compact notes (parallel, batched), then
  // REDUCE all notes into the final summary — so it reflects the WHOLE document.
  const chunks = chunkText(normalized, MAP_CHUNK_CHARS);
  let failedChunks = 0;
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
      failedChunks += 1;
      return ""; // a failed chunk is skipped, not fatal.
    }
  });

  // If a large fraction of the document failed to map, the reduce step would
  // silently summarize only the surviving minority as if it were the whole
  // document. Throw so the request fails with a real error and the user can
  // retry, rather than presenting a confident but partial summary.
  const MAX_FAILED_CHUNK_RATIO = 0.4;
  if (chunks.length > 0 && failedChunks / chunks.length > MAX_FAILED_CHUNK_RATIO) {
    throw new Error(
      `study.summary.too_many_map_failures: ${failedChunks}/${chunks.length} chunks failed`,
    );
  }

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
    const parsed = parseJson<{
      title: string;
      mode?: string;
      examTips?: string[];
      sections: Array<{
        heading: string;
        priority?: string;
        bullets: string[];
      }>;
    }>(raw);
    assertShape(
      Array.isArray(parsed?.sections) &&
        parsed.sections.length > 0 &&
        parsed.sections.some(
          (s) => Array.isArray(s?.bullets) && s.bullets.length > 0,
        ),
      "notes",
    );
    return parsed;
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
    assertShape(
      Array.isArray(cards) &&
        cards.some((c) => String(c?.front || "").trim() && String(c?.back || "").trim()),
      "flashcards",
    );
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
    assertShape(
      Array.isArray(quizzes) &&
        quizzes.some((q) => String(q?.question || "").trim()),
      "quizzes",
    );
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
}

/**
 * Generate an artifact with the AI. There is NO offline/deterministic fallback:
 * every artifact is produced live by Gemini. If the model can't be
 * reached/parsed, this throws and the caller surfaces a real error — we never
 * fabricate a stub and present it as an AI result (that made outages look like
 * "the AI always returns the same summary").
 */
export async function generateArtifact(
  type: StudyArtifactType,
  rawSourceText: string,
  options: GenerateArtifactOptions = {},
): Promise<GeneratedArtifact> {
  const sourceText = sanitizeSourceText(rawSourceText);
  const mode = resolveMode(options.mode);
  const examTopics = (options.examTopics || []).map((t) => t.trim()).filter(Boolean);

  const previousContent = options.previousContent;

  switch (type) {
    case "summary":
      return { content: await buildSummary(sourceText, mode, previousContent) };
    case "notes":
      return {
        content: await buildNotes(sourceText, mode, examTopics, previousContent),
      };
    case "flashcards":
      return {
        content: await buildFlashcards(sourceText, mode, previousContent),
      };
    case "quizzes":
      return {
        content: await buildQuiz(sourceText, mode, examTopics, previousContent),
      };
    default:
      throw new Error(`Unsupported generation type: ${type}`);
  }
}
