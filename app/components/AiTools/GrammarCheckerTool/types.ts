/**
 * Grammar Checker — shared types + pure logic.
 *
 * Backend: NestJS `/tools/grammar-check` (see scholarlyhelp repo,
 * src/modules/tools/grammar-checker). The server anchors every issue to exact
 * char offsets in the submitted text and drops anything unanchorable, so the
 * client can slice the document by offsets with no fuzzy matching.
 *
 * All text mutations go through `applyFix` so later issues' offsets shift by
 * the exact length delta — never string-replace on rendered markup.
 */

export const MIN_GRAMMAR_WORDS = 5;
export const MAX_GRAMMAR_WORDS = 1500;
export const DICTIONARY_MAX_WORDS = 200;

export type GrammarCategory = "grammar" | "tense" | "clarity" | "tone";
export type IssueStatus = "open" | "accepted" | "dismissed" | "dictionary";

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  "grammar",
  "tense",
  "clarity",
  "tone",
];

/** Issue as the server returns it (offsets refer to the submitted text). */
export interface ServerIssue {
  id: string;
  category: GrammarCategory;
  original: string;
  occurrence: number;
  start: number;
  end: number;
  suggestion: string;
  explanation: string;
  sentence: string;
}

/** Issue as the client tracks it (offsets refer to the CURRENT doc text). */
export interface ClientIssue extends ServerIssue {
  status: IssueStatus;
  /** Surfaced by a sentence re-check after an accepted fix. */
  isNew?: boolean;
}

export interface GrammarCheckResponse {
  issues: ServerIssue[];
  stats: { word_count: number; char_count: number; sentence_count: number };
  meta: {
    llm_used: string;
    scope: string;
    chunks: number;
    dropped_unanchored: number;
    tokens_used: number;
  };
}

export interface GrammarGoals {
  dialect: "us" | "uk" | "ca" | "au";
  formality: "informal" | "neutral" | "formal";
  section: "general" | "literature-review" | "methodology" | "discussion";
}

export const DEFAULT_GOALS: GrammarGoals = {
  dialect: "us",
  formality: "neutral",
  section: "general",
};

export const CATEGORY_META: Record<
  GrammarCategory,
  { label: string; labelColor: string; dialColor: string; markClass: string }
> = {
  grammar: {
    label: "Grammar",
    labelColor: "text-red-600 dark:text-red-400",
    dialColor: "#dc2626",
    markClass: "border-b-2 border-solid border-red-500",
  },
  tense: {
    label: "Tense",
    labelColor: "text-[#565add] dark:text-[#8b8ff0]",
    dialColor: "#565add",
    markClass: "border-b-2 border-solid border-[#565add]",
  },
  clarity: {
    label: "Clarity",
    labelColor: "text-[#ca8a04] dark:text-amber-400",
    dialColor: "#ca8a04",
    markClass:
      "border-b-2 border-solid border-[#ca8a04] bg-amber-50 dark:bg-amber-900/20",
  },
  tone: {
    label: "Tone",
    labelColor: "text-[#7c3aed] dark:text-[#a78bfa]",
    dialColor: "#7c3aed",
    markClass: "border-b-2 border-dotted border-[#7c3aed]",
  },
};

// ---------------------------------------------------------------------------
// Scores (prototype formula: each open issue costs an equal share of 60 pts,
// floor 40 — so a category with all issues resolved reads 100).
// ---------------------------------------------------------------------------

export function categoryScore(total: number, remaining: number): number {
  if (total <= 0) return 100;
  const deduction = 60 / total;
  const score = Math.round(100 - remaining * deduction);
  return Math.max(40, Math.min(100, score));
}

export interface CategoryScores {
  grammar: number;
  tense: number;
  clarity: number;
  tone: number;
  overall: number;
}

/**
 * `totals` = issues ever seen per category (incl. re-check finds);
 * remaining = still-open ones. Accepted/dismissed/dictionary all count as
 * handled — the score rewards working through the list either way.
 */
export function computeScores(issues: ClientIssue[]): CategoryScores {
  const scores = { grammar: 100, tense: 100, clarity: 100, tone: 100 };
  for (const cat of GRAMMAR_CATEGORIES) {
    const inCat = issues.filter((i) => i.category === cat);
    const open = inCat.filter((i) => i.status === "open");
    scores[cat] = categoryScore(inCat.length, open.length);
  }
  const overall = Math.round(
    (scores.grammar + scores.tense + scores.clarity + scores.tone) / 4,
  );
  return { ...scores, overall };
}

// ---------------------------------------------------------------------------
// Text mutation — the single write path for accepting a fix.
// ---------------------------------------------------------------------------

export interface ApplyFixResult {
  text: string;
  issues: ClientIssue[];
  /** Where the replacement landed in the NEW text (for sentence re-check). */
  editedRange: { start: number; end: number };
}

/**
 * Replace the issue's [start, end) with its suggestion, mark it accepted, and
 * shift every later issue's offsets by the length delta. Offsets stay exact
 * regardless of duplicate substrings — no searching involved.
 */
export function applyFix(
  text: string,
  issues: ClientIssue[],
  issueId: string,
): ApplyFixResult | null {
  const target = issues.find((i) => i.id === issueId);
  if (!target || target.status !== "open") return null;

  const newText =
    text.slice(0, target.start) + target.suggestion + text.slice(target.end);
  const delta = target.suggestion.length - (target.end - target.start);

  const nextIssues = issues.map((issue) => {
    if (issue.id === issueId) {
      return {
        ...issue,
        status: "accepted" as IssueStatus,
        end: issue.start + issue.suggestion.length,
      };
    }
    if (issue.start >= target.end) {
      return { ...issue, start: issue.start + delta, end: issue.end + delta };
    }
    return issue;
  });

  return {
    text: newText,
    issues: nextIssues,
    editedRange: { start: target.start, end: target.start + target.suggestion.length },
  };
}

/** Corrected-text view: all still-open suggestions applied at once. */
export function deriveCorrectedText(text: string, issues: ClientIssue[]): string {
  const open = issues
    .filter((i) => i.status === "open")
    .sort((a, b) => a.start - b.start);
  let out = "";
  let cursor = 0;
  for (const issue of open) {
    if (issue.start < cursor) continue; // overlap safety — server already dedupes
    out += text.slice(cursor, issue.start) + issue.suggestion;
    cursor = issue.end;
  }
  out += text.slice(cursor);
  return out;
}

/**
 * Locate the sentence containing `position` — used to re-check just the
 * edited sentence after an accepted fix.
 */
export function sentenceAt(
  text: string,
  position: number,
): { text: string; start: number; end: number } {
  const enders = /[.!?](?=\s|$)/g;
  let start = 0;
  let match: RegExpExecArray | null;
  while ((match = enders.exec(text)) !== null) {
    const boundary = match.index + 1;
    if (boundary <= position) {
      start = boundary;
      continue;
    }
    return {
      start: skipLeadingSpace(text, start, boundary),
      end: boundary,
      text: text.slice(skipLeadingSpace(text, start, boundary), boundary),
    };
  }
  const s = skipLeadingSpace(text, start, text.length);
  return { start: s, end: text.length, text: text.slice(s) };
}

function skipLeadingSpace(text: string, from: number, to: number): number {
  let i = from;
  while (i < to && /\s/.test(text[i])) i++;
  return i;
}

// ---------------------------------------------------------------------------
// Performance report (all client-side, mirrors the product spec)
// ---------------------------------------------------------------------------

export interface ReportStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  readTimeMin: number;
  fkGrade: number;
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const m = w.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export function buildReportStats(text: string): ReportStats {
  const clean = text.replace(/\s+/g, " ").trim();
  const words = clean ? clean.split(" ").filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = clean.replace(/\s/g, "").length;
  const sentenceCount = clean
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  const avgSentenceLength = sentenceCount
    ? Math.round((wordCount / sentenceCount) * 10) / 10
    : 0;
  const readTimeMin = Math.max(1, Math.round(wordCount / 200));
  const totalSyllables = words.reduce((sum, w) => sum + syllables(w), 0);
  const fk =
    sentenceCount && wordCount
      ? 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59
      : 0;
  return {
    wordCount,
    charCount,
    sentenceCount,
    avgSentenceLength,
    readTimeMin,
    fkGrade: Math.max(1, Math.round(fk)),
  };
}
