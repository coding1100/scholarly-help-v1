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

export function chunkText(input: string, maxChars = 700): string[] {
  const sentences = splitSentences(input);
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
