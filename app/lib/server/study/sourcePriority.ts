import { chunkText, normalizeText } from "@/app/lib/server/study/text";
import { StudyLearningMode } from "@/app/lib/server/study/types";

const IMPORTANCE_PATTERNS = [
  /\b(important|key point|remember|must know|exam|test|critical|essential|definition|summary)\b/gi,
  /\b(chapter|section|unit|module|topic)\s*\d*/gi,
];

function scoreChunk(chunk: string, examTopics: string[]): number {
  let score = 0;
  const lower = chunk.toLowerCase();
  const lines = chunk.split(/\n/).map((l) => l.trim()).filter(Boolean);

  if (lines[0] && /^#{1,4}\s/.test(lines[0])) score += 4;
  if (lines[0] && /^[A-Z][^.!?]{4,70}$/.test(lines[0])) score += 2;

  for (const pattern of IMPORTANCE_PATTERNS) {
    const matches = chunk.match(pattern);
    if (matches) score += matches.length * 1.5;
  }

  const words = lower.split(/\W+/).filter((w) => w.length > 3);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  for (const [, count] of freq) {
    if (count >= 3) score += count * 0.4;
  }

  if (chunk.length > 120 && chunk.length < 900) score += 1;

  for (const topic of examTopics) {
    const t = topic.toLowerCase().trim();
    if (t.length > 2 && lower.includes(t)) score += 5;
  }

  return score;
}

export function prioritizeSourceText(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[] = [],
  options: { charCap?: number; chunkLimit?: number } = {},
): string {
  const normalized = sourceText.trim();
  if (!normalized) return "";

  const cap = options.charCap ?? (mode === "research" ? 20000 : 16000);

  const chunks = chunkText(normalized, 650);
  if (chunks.length <= 1) return normalized.slice(0, cap);

  const ranked = chunks
    .map((chunk, index) => ({ index, chunk, score: scoreChunk(chunk, examTopics) }))
    .sort((a, b) => b.score - a.score);

  const limit =
    options.chunkLimit ??
    (mode === "exam" ? 22 : mode === "quiz" ? 18 : chunks.length);

  const selected = ranked.slice(0, Math.min(limit, ranked.length));
  selected.sort((a, b) => a.index - b.index);

  const merged = selected.map((s) => s.chunk).join("\n\n");
  return merged.slice(0, cap);
}

export function extractTopicCandidates(sourceText: string): string[] {
  const topics = new Set<string>();
  const lines = sourceText.split(/\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length > 120) continue;

    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading?.[1]) {
      topics.add(normalizeText(heading[1]));
      continue;
    }

    if (
      /^(chapter|section|unit|module|part|lesson)\s+[\dIVXivx]+/i.test(line) ||
      /^(chapter|section|unit|module)\s*:/i.test(line)
    ) {
      topics.add(normalizeText(line.slice(0, 100)));
      continue;
    }

    if (
      line.length >= 8 &&
      line.length <= 70 &&
      /^[A-Z0-9]/.test(line) &&
      !line.endsWith(".") &&
      !/^\d+\./.test(line)
    ) {
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 10) {
        topics.add(normalizeText(line));
      }
    }
  }

  return Array.from(topics).slice(0, 14);
}
