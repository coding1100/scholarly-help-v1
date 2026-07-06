const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+/;

export function normalizeText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function splitSentences(input: string): string[] {
  return normalizeText(input)
    .split(SENTENCE_SPLIT_REGEX)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Split a single oversized "sentence" (tables, code, OCR'd text, or bullet
 * lists with no terminal punctuation can produce one giant token stream) into
 * word-bounded pieces no longer than `maxChars`. Without this a lone sentence
 * blows straight past the chunk cap, handing the map step an oversized excerpt
 * and starving the chunk-length prioritizer.
 */
function hardSplitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/).filter(Boolean);
  const pieces: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      pieces.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) pieces.push(current);
  return pieces.length > 0 ? pieces : [text.slice(0, maxChars)];
}

export function chunkText(input: string, maxChars = 700): string[] {
  const sentences = splitSentences(input).flatMap((sentence) =>
    // Guarantee no single unit exceeds the cap before packing.
    hardSplitLongText(sentence, maxChars),
  );
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [normalizeText(input)];
}

export function countWords(input: string): number {
  const normalized = normalizeText(input);
  if (!normalized) return 0;
  return normalized.split(" ").filter(Boolean).length;
}

/**
 * Target length (in words) for an AI summary, scaled to the source length.
 *
 * Short content uses a higher ratio (up to ~20% under 10 pages) because it
 * needs more detail to be useful; long, redundant documents compress harder
 * (down to ~5% at 50+ pages). A minimum floor of 80 words guarantees that even
 * very short inputs produce a real, multi-sentence summary — never below it.
 *
 * Pages are estimated from word count (~500 words/page) since the source is
 * plain extracted text, not paginated.
 */
export function summaryTargetWordCount(sourceWordCount: number): {
  target: number;
  ratio: number;
  estimatedPages: number;
} {
  const WORDS_PER_PAGE = 500;
  // Never produce a summary shorter than this, regardless of the % (per spec).
  const MIN_WORDS = 80;

  const words = Math.max(sourceWordCount, 0);
  const estimatedPages = words / WORDS_PER_PAGE;

  // Piecewise ratio: 20% under 10 pages, easing to 10% baseline by ~20 pages,
  // then down to 5% at 50+ pages. Linear interpolation between the anchors.
  let ratio: number;
  if (estimatedPages <= 10) {
    ratio = 0.2;
  } else if (estimatedPages <= 20) {
    // 10pp → 20%, 20pp → 10%
    ratio = 0.2 - ((estimatedPages - 10) / 10) * 0.1;
  } else if (estimatedPages <= 50) {
    // 20pp → 10%, 50pp → 5%
    ratio = 0.1 - ((estimatedPages - 20) / 30) * 0.05;
  } else {
    ratio = 0.05;
  }

  const target = Math.max(MIN_WORDS, Math.round(words * ratio));
  return { target, ratio, estimatedPages };
}

/**
 * Target number of quiz questions for a source, scaled to its length.
 *
 * Product rule: a quiz covers ~20% of the uploaded content, drawn from the most
 * relevant/important material. Pages are estimated from word count
 * (~500 words/page). We map "20% of the pages" to one question per covered
 * page, so a 100-page source (~50k words) → 20 pages → 20 questions. A hard
 * floor of 10 questions guarantees a usable quiz even for short sources; a cap
 * keeps generation bounded for very large inputs.
 */
export function quizTargetQuestionCount(sourceWordCount: number): {
  target: number;
  estimatedPages: number;
  coveredPages: number;
} {
  const WORDS_PER_PAGE = 500;
  const COVERAGE_RATIO = 0.2; // 20% of the content
  const MIN_QUESTIONS = 10;
  const MAX_QUESTIONS = 40;

  const words = Math.max(sourceWordCount, 0);
  const estimatedPages = words / WORDS_PER_PAGE;
  const coveredPages = estimatedPages * COVERAGE_RATIO;

  // One question per covered page, floored at the minimum and capped.
  const raw = Math.round(coveredPages);
  const target = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, raw));

  return { target, estimatedPages, coveredPages };
}

export function topChunksByQuery(chunks: string[], query: string, limit = 3) {
  const qTokens = normalizeText(query)
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);

  return chunks
    .map((chunk, index) => {
      const lower = chunk.toLowerCase();
      const score = qTokens.reduce(
        (acc, token) => acc + (lower.includes(token) ? 1 : 0),
        0,
      );
      return { index, chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
