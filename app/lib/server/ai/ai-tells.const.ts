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

/**
 * Date this content-tell vocabulary was last reviewed (ISO yyyy-mm-dd). MIRROR of the
 * backend CONTENT_TELLS_VERSION (T4). The overused-AI-word list decays over time, so
 * this stamp lets tooling warn when the list is stale. Keep byte-identical to the
 * backend value; the drift test checks it.
 */
export const CONTENT_TELLS_VERSION = "2026-07-08";

/** Days before the content-tell list is considered stale. MIRROR of the backend. */
export const CONTENT_TELLS_MAX_AGE_DAYS = 180;

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
 * Structural AI tell: copula avoidance. MIRROR of the backend's COPULA_REPLACEMENTS
 * (source of truth: scholarlyhelp humanizer utils/ai-tells.const.ts). The backend
 * humanizer reverts these elevated verbs to plain copulas in its enforce pass; this
 * copy exists so the shared rule set stays in one place and a drift test can assert
 * the two repos agree. Not fed into countTells (see backend note): these verbs appear
 * legitimately too often to score every occurrence.
 */
export const COPULA_REPLACEMENTS: Record<string, string> = {
  "serves as": "is",
  "serve as": "are",
  "stands as": "is",
  "stand as": "are",
  "acts as": "is",
  "act as": "are",
  "functions as": "is",
  "function as": "are",
  boasts: "has",
  boast: "have",
};

/** The copula-avoidance verbs. MIRROR of the backend COPULA_TELL_TOKENS. */
export const COPULA_TELL_TOKENS: readonly string[] = Object.keys(COPULA_REPLACEMENTS);

/**
 * Structural AI tell: negative parallelisms ("not just X, but Y"). MIRROR of the
 * backend NEGATIVE_PARALLELISM_MARKERS. The backend humanizer flattens the formulaic
 * variants; kept here to keep the rule set in one place.
 */
export const NEGATIVE_PARALLELISM_MARKERS: readonly string[] = [
  "it's not just",
  "it is not just",
  "it's not only",
  "it is not only",
  "not only",
  "not merely",
  "not simply",
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
