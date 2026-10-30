import { describe, expect, it } from "vitest";
import {
  DAILY_PLAY_LIMIT,
  consumePlay,
  localDay,
  playsUsedToday,
  splitIntoChunks,
  wordAt,
} from "./speech";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const today = new Date(2026, 9, 30, 23, 59);
const tomorrow = new Date(2026, 9, 31, 0, 1);

describe("daily play allowance", () => {
  it("uses the local calendar day", () => {
    expect(localDay(today)).toBe("2026-10-30");
    expect(localDay(tomorrow)).toBe("2026-10-31");
  });

  it(`allows ${DAILY_PLAY_LIMIT} plays a day, then refuses`, () => {
    const storage = memoryStorage();
    for (let play = 1; play <= DAILY_PLAY_LIMIT; play += 1) {
      expect(consumePlay(storage, today)).toBe(play);
    }
    expect(consumePlay(storage, today)).toBeNull();
    expect(playsUsedToday(storage, today)).toBe(DAILY_PLAY_LIMIT);
  });

  it("resets on the next local day", () => {
    const storage = memoryStorage();
    for (let play = 0; play < DAILY_PLAY_LIMIT; play += 1) consumePlay(storage, today);
    expect(playsUsedToday(storage, tomorrow)).toBe(0);
    expect(consumePlay(storage, tomorrow)).toBe(1);
  });

  it("treats a corrupt record as no plays used", () => {
    const storage = memoryStorage({ "read-my-essay:plays": "{not json" });
    expect(playsUsedToday(storage, today)).toBe(0);
    const negative = memoryStorage({
      "read-my-essay:plays": JSON.stringify({ day: "2026-10-30", count: -5 }),
    });
    expect(playsUsedToday(negative, today)).toBe(0);
  });

  it("still plays when storage throws", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(consumePlay(blocked, today)).toBe(1);
  });
});

describe("splitIntoChunks", () => {
  it("splits on sentences and keeps each chunk's offset", () => {
    const text = "First one. Second one!\nThird?";
    const chunks = splitIntoChunks(text);
    expect(chunks.map((c) => c.text)).toEqual(["First one.", " Second one!", "Third?"]);
    for (const chunk of chunks) {
      expect(text.slice(chunk.start, chunk.start + chunk.text.length)).toBe(chunk.text);
    }
  });

  it("breaks long sentences at a space without losing text", () => {
    const text = `${"word ".repeat(120)}end.`;
    const chunks = splitIntoChunks(text, 48);
    expect(chunks.every((c) => c.text.length <= 48)).toBe(true);
    expect(chunks.map((c) => c.text).join("")).toBe(text);
    const words = chunks.flatMap((c) => c.text.trim().split(/\s+/));
    expect(new Set(words)).toEqual(new Set(["word", "end."]));
    for (const chunk of chunks) {
      expect(text.slice(chunk.start, chunk.start + chunk.text.length)).toBe(chunk.text);
    }
  });

  it("returns nothing for blank text", () => {
    expect(splitIntoChunks("  \n\n ")).toEqual([]);
  });
});

describe("wordAt", () => {
  const text = "Read my essay.";

  it("finds the word around an offset", () => {
    expect(wordAt(text, 5)).toEqual({ start: 5, end: 7 });
    expect(wordAt(text, 10)).toEqual({ start: 8, end: 14 });
  });

  it("returns null on whitespace or out of range", () => {
    expect(wordAt(text, 4)).toBeNull();
    expect(wordAt(text, -1)).toBeNull();
    expect(wordAt(text, text.length)).toBeNull();
  });
});
