"use client";

import { generateEssayOutline } from "./academicResearchApi";

/**
 * Single source of truth for research-assistant heading/outline generation.
 *
 * Previously two separate, inconsistent code paths existed (MainDocEditer and
 * PromptModal), and the modal path could emit a single "<h1>Main Heading</h1>"
 * on an empty API response — the PDF's "Selected generate headings. Got only
 * this" complaint. This module unifies both so every entry point produces a
 * complete, document-type-appropriate heading set and never a lone heading.
 */

export type OutlineMode = "standard" | "smart" | "none";

export type DocumentKind = "research" | "essay";

export type GenerateOutlineResult = {
  /** Section titles, first item is the document's H1. Empty for "none". */
  sections: string[];
  /**
   * Sub-points for each section in `sections` (same index), when the source
   * provided them (smart/AI mode only — standard/none never have these).
   * Empty array for a section with no sub-points of its own.
   */
  subsections: string[][];
  /** True when we fell back to the deterministic skeleton (smart mode only). */
  usedFallback: boolean;
};

const MAX_HEADING_LEN = 90;

const clampHeading = (text: string): string =>
  text.trim().slice(0, MAX_HEADING_LEN);

/**
 * Heuristic: decide whether the prompt reads like a formal research/dissertation
 * document (which wants Abstract / Literature Review / Methodology / Results …)
 * or a general essay (Introduction / Body / Conclusion). Defaults to research,
 * which is this tool's primary use case.
 */
export const detectDocumentKind = (prompt: string): DocumentKind => {
  const p = prompt.toLowerCase();
  const essaySignals =
    /\b(essay|argue|argument|persuasive|opinion|discuss whether|reflective|narrative|compare and contrast)\b/;
  const researchSignals =
    /\b(research|study|dissertation|thesis|methodology|empirical|literature review|systematic|experiment|hypothesis|data|analysis|mphil|phd)\b/;

  if (essaySignals.test(p) && !researchSignals.test(p)) return "essay";
  return "research";
};

/**
 * Deterministic, document-type-aware heading skeleton. Used for "standard"
 * headings (no AI call) and as the guaranteed fallback for "smart" headings.
 * Mirrors the MPhil/academic structure requested in the product spec.
 */
export const standardOutline = (
  prompt: string,
  kind: DocumentKind = detectDocumentKind(prompt),
): string[] => {
  const topic = clampHeading(prompt) || "Untitled";

  if (kind === "essay") {
    return [
      topic,
      "Introduction",
      "Background and Context",
      "Main Argument",
      "Supporting Evidence",
      "Counter-Arguments",
      "Conclusion",
    ];
  }

  // Research / dissertation (MPhil) structure.
  return [
    topic,
    "Abstract",
    "Introduction",
    "Literature Review",
    "Methodology",
    "Results and Findings",
    "Discussion",
    "Conclusion",
    "References",
  ];
};

/**
 * Build the editor HTML for an outline (H1 for the first section, H2 for the
 * rest). When `subsections[i]` has entries, they're rendered as a bullet list
 * under that section — this is the AI-generated sub-outline detail; it's
 * lost if the caller omits `subsections` (e.g. the deterministic skeleton,
 * which has none).
 */
export const outlineToHtml = (
  sections: string[],
  subsections?: string[][],
): string => {
  if (!sections.length) return "<h1>Untitled</h1><p></p>";
  return sections
    .map((section, index) => {
      const heading =
        index === 0
          ? `<h1>${escapeHtml(section)}</h1>`
          : `<h2>${escapeHtml(section)}</h2>`;
      const points = (subsections?.[index] || []).filter(Boolean);
      const list = points.length
        ? `<ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
        : "<p></p>";
      return `${heading}${list}`;
    })
    .join("");
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Derive a reasonable document title from the prompt. */
export const titleFromPrompt = (prompt: string): string =>
  (prompt.split(/[.?!]/)[0] || "").trim().slice(0, 80) || "Untitled";

/**
 * Generate an outline for the chosen mode.
 *
 * - "standard": deterministic, never calls the API, never empty.
 * - "smart": calls the outline API; on empty/error, falls back to the
 *   deterministic skeleton (usedFallback = true) — never a lone heading.
 * - "none": returns an empty section list (blank document).
 *
 * Throws only on a genuine error in "smart" mode if the caller wants to react;
 * callers that prefer graceful degradation can use `generateOutlineSafe`.
 */
export const generateOutline = async (
  mode: OutlineMode,
  prompt: string,
): Promise<GenerateOutlineResult> => {
  if (mode === "none") {
    return { sections: [], subsections: [], usedFallback: false };
  }

  const kind = detectDocumentKind(prompt);

  if (mode === "standard") {
    return {
      sections: standardOutline(prompt, kind),
      subsections: [],
      usedFallback: false,
    };
  }

  // Smart mode: ask the API, then guarantee a full skeleton on empty result.
  const response = await generateEssayOutline({
    topic: prompt,
    essay_type: kind === "essay" ? "argumentative" : "descriptive",
    essay_level: "post graduate",
  });

  // Built together (not sections.map().filter()) so `subsections[i]` always
  // lines up with `sections[i]` even when some items get dropped for having
  // no title — a separate post-hoc filter would desync the two indices.
  const sections: string[] = [];
  const subsections: string[][] = [];
  for (const item of response.outline ?? []) {
    const title =
      typeof item === "string"
        ? item
        : item?.section || item?.title || "";
    const trimmed = String(title).trim();
    if (!trimmed) continue;
    sections.push(trimmed);
    const points = typeof item === "object" && Array.isArray(item?.subsections)
      ? item.subsections.map((p) => String(p).trim()).filter(Boolean)
      : [];
    subsections.push(points);
  }

  if (sections.length === 0) {
    return {
      sections: standardOutline(prompt, kind),
      subsections: [],
      usedFallback: true,
    };
  }

  return { sections, subsections, usedFallback: false };
};

/**
 * Like `generateOutline` but never throws: on API error in "smart" mode it
 * returns the deterministic skeleton with usedFallback = true.
 */
export const generateOutlineSafe = async (
  mode: OutlineMode,
  prompt: string,
): Promise<GenerateOutlineResult> => {
  try {
    return await generateOutline(mode, prompt);
  } catch {
    if (mode === "none") return { sections: [], subsections: [], usedFallback: false };
    return { sections: standardOutline(prompt), subsections: [], usedFallback: true };
  }
};
