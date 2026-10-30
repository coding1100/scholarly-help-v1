// Browser-independent helpers for the Read My Essay tool: the play allowance,
// splitting text into utterances, and locating the word being spoken.

export const MAX_CHARACTERS = 1200;
export const DAILY_PLAY_LIMIT = 20;

const PLAYS_KEY = "read-my-essay:plays";

/** Local calendar day, so the allowance resets at the visitor's midnight. */
export function localDay(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

type PlayStorage = Pick<Storage, "getItem" | "setItem">;

/** Plays already used today. Unreadable or stale records count as none. */
export function playsUsedToday(storage: PlayStorage, now: Date): number {
  try {
    const record = JSON.parse(storage.getItem(PLAYS_KEY) ?? "null");
    if (record?.day !== localDay(now)) return 0;
    return Number.isInteger(record.count) && record.count > 0 ? record.count : 0;
  } catch {
    return 0;
  }
}

/**
 * Uses one play if today's allowance has any left. Returns the plays used
 * after this call, or null when the limit is already reached.
 */
export function consumePlay(storage: PlayStorage, now: Date): number | null {
  const used = playsUsedToday(storage, now);
  if (used >= DAILY_PLAY_LIMIT) return null;
  const next = used + 1;
  try {
    storage.setItem(PLAYS_KEY, JSON.stringify({ day: localDay(now), count: next }));
  } catch {
    // Storage is blocked (private mode, quota): let the play go ahead.
  }
  return next;
}

export interface TextChunk {
  text: string;
  /** Offset of the chunk in the full text, to map boundary events back. */
  start: number;
}

const CHUNK_LENGTH = 220;

/**
 * Splits text into sentence-sized utterances. Chrome's network voices stop
 * after about 15 seconds of one utterance, so long text is spoken as a queue.
 */
export function splitIntoChunks(text: string, maxLength = CHUNK_LENGTH): TextChunk[] {
  const chunks: TextChunk[] = [];
  for (const match of text.matchAll(/[^.!?\n]+[.!?]*|[.!?\n]+/g)) {
    let start = match.index ?? 0;
    let rest = match[0];
    while (rest.length > maxLength) {
      const cut = rest.lastIndexOf(" ", maxLength);
      const end = cut > 0 ? cut : maxLength;
      chunks.push({ text: rest.slice(0, end), start });
      start += end;
      rest = rest.slice(end);
    }
    if (rest.trim()) chunks.push({ text: rest, start });
  }
  return chunks;
}

/** The word around a character offset, as [start, end) in the text. */
export function wordAt(text: string, index: number): { start: number; end: number } | null {
  if (index < 0 || index >= text.length || /\s/.test(text[index])) return null;
  let start = index;
  let end = index;
  while (start > 0 && !/\s/.test(text[start - 1])) start -= 1;
  while (end < text.length && !/\s/.test(text[end])) end += 1;
  return { start, end };
}
