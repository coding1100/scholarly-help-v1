/**
 * MIRROR of the backend's single source of truth for AI-tell rules.
 *
 * Source of truth: scholarlyhelp `src/modules/tools/humanizer/utils/ai-tells.const.ts`.
 * The humanizer (backend) REMOVES these tells; this detector (frontend) SCORES them.
 * They MUST agree, or the humanizer will clear its own checks while the detector still
 * flags the result — the exact "AI score still high after humanizing" failure.
 *
 * Keep these values byte-identical to the backend file. The two repos can't share an
 * import, so this copy is intentional. If you change a list here, change it there too.
 */

/** Formal transition words detectors weight heavily ("robotic" connectives). */
export const FORMAL_TRANSITIONS: readonly string[] = [
  "moreover",
  "furthermore",
  "additionally",
  "therefore",
  "consequently",
  "thus",
  "hence",
  "however",
  "notably",
  "overall",
  "nonetheless",
  "nevertheless",
  "subsequently",
  "accordingly",
  "henceforth",
];

/** Multi-word formal connectives. */
export const FORMAL_TRANSITION_PHRASES: readonly string[] = [
  "in conclusion",
  "in summary",
  "as a result",
  "in addition",
  "on the other hand",
  "it is important to note",
  "it is worth noting",
];

/** Content-pattern AI-tell vocabulary (machine-generated regardless of position). */
export const CONTENT_TELL_TOKENS: readonly string[] = [
  "delve",
  "tapestry",
  "leverage",
  "robust",
  "seamless",
  "cutting-edge",
  "transformative",
  "utilize",
  "groundbreaking",
  "unlock",
  "testament",
  "underscore",
  "underscores",
  "realm",
  "vibrant",
  "intricate",
  "intricacies",
  "pivotal",
  "showcase",
  "showcasing",
  "interplay",
  "landscape",
  "foster",
  "fostering",
  "garner",
  "enduring",
  "in today",
  "navigate the",
  "when it comes to",
  "it is important to note",
  "plays a crucial role",
  "plays a vital role",
  "a testament to",
  "in the realm of",
];

/**
 * Burstiness threshold. Population stddev of per-sentence word counts AT OR BELOW
 * this is a tell. Mirrors the backend humanizer's repair floor, so text that cleared
 * the humanizer scores low here by construction.
 */
export const BURSTINESS_STDDEV_FLOOR = 5.5;

/** Target sentence-length band the humanizer aims for. */
export const SENTENCE_LEN_MIN = 5;
export const SENTENCE_LEN_MAX = 30;

/**
 * Count distinct AI-tell occurrences in a passage, split by bucket so the scorer can
 * weight transitions (high signal) separately from content tells. Case-insensitive,
 * word/phrase boundary aware.
 */
export function countTells(text: string): {
  transitions: number;
  contentTells: number;
  total: number;
  matched: string[];
} {
  const matched: string[] = [];
  let transitions = 0;
  let contentTells = 0;

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const tally = (terms: readonly string[], bucket: "t" | "c") => {
    for (const term of terms) {
      const re = new RegExp(`\\b${escape(term)}\\b`, "gi");
      const hits = text.match(re);
      if (hits && hits.length > 0) {
        matched.push(term);
        if (bucket === "t") transitions += hits.length;
        else contentTells += hits.length;
      }
    }
  };

  tally([...FORMAL_TRANSITIONS, ...FORMAL_TRANSITION_PHRASES], "t");
  tally(CONTENT_TELL_TOKENS, "c");

  return { transitions, contentTells, total: transitions + contentTells, matched };
}
