"use client";

import { CSSProperties, FC } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { sanitizeHtml } from "@/app/utils/sanitizeHtml";

/**
 * Shared LaTeX-aware prose renderer, extracted from MathSolver/StemSolver.tsx
 * so any tool whose prompts ask the model for $...$-delimited LaTeX (see
 * TUTOR_SYSTEM_PROMPT in the Homework Helper backend, or StemSolver's own
 * prompts) can render it consistently instead of showing raw "$4 \times 8$"
 * text. Keep any future changes to the parsing/delimiter rules here so both
 * tools stay in sync rather than drifting apart via copy-paste.
 */

/** Render a bare KaTeX string to an HTML string; falls back to the raw text. */
function renderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return tex;
  }
}

/** A pure-LaTeX expression (e.g. a schema's `formula`/`math` field), rendered as block math. */
export const BlockMath: FC<{ tex: string }> = ({ tex }) => (
  <div
    className="my-1 overflow-x-auto"
    dangerouslySetInnerHTML={{ __html: renderKatex(tex, true) }}
  />
);

export const InlineMath: FC<{ tex: string }> = ({ tex }) => (
  <span dangerouslySetInnerHTML={{ __html: renderKatex(tex, false) }} />
);

/**
 * Render prose that may contain inline/block math in mixed delimiters. The
 * model is inconsistent — it emits $...$, $$...$$, \(...\), \[...\], and
 * sometimes escapes a literal \$. Normalize everything to $/$$ first, then
 * split on those delimiters and render the math segments with KaTeX and the
 * rest as plain text. This avoids the markdown "two stray dollars become
 * garbled math" false positive.
 */
const LITERAL_DOLLAR = " DOLLAR ";

/**
 * Safety net for prose that contains BARE LaTeX (\sqrt{}, \text{}, ^, _, \to …)
 * not wrapped in $…$. The model is told to always use $…$, but older or
 * lapsed responses can still leak raw commands; this wraps detected LaTeX runs
 * so KaTeX renders them instead of showing "\sqrt{75}" as literal text.
 * Brace-aware so groups containing spaces (e.g. \text{ m/s}) stay intact.
 */
function autoWrapBareLatex(s: string): string {
  if (!s || s.includes("$")) return s; // leave existing $-delimited math alone
  if (!/\\[a-zA-Z]+|[\^_]/.test(s)) return s; // no LaTeX markers at all

  const readBraces = (j: number): number => {
    let depth = 0;
    for (let k = j; k < s.length; k++) {
      if (s[k] === "{") depth++;
      else if (s[k] === "}" && --depth === 0) return k + 1;
    }
    return s.length;
  };
  const readMathToken = (j: number): number => {
    const c = s[j];
    if (c === "\\") {
      const m = /^\\[a-zA-Z]+/.exec(s.slice(j));
      if (!m) return Math.min(j + 2, s.length);
      let end = j + m[0].length;
      while (s[end] === "{") end = readBraces(end);
      return end;
    }
    if (c === "^" || c === "_") {
      const end = j + 1;
      return s[end] === "{" ? readBraces(end) : Math.min(end + 1, s.length);
    }
    return -1;
  };
  const isOperand = (c: string) => /[0-9.+\-=×*/()]/.test(c);

  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c !== "\\" && c !== "^" && c !== "_") {
      out += c;
      i++;
      continue;
    }
    // Pull a leading numeric operand back into the run (e.g. "4.9 " before \text).
    let lead = "";
    out = out.replace(/([0-9.]+\s*)$/, (mm) => {
      lead = mm;
      return "";
    });
    let run = lead;
    let j = i;
    while (j < s.length) {
      const tEnd = readMathToken(j);
      if (tEnd > j) {
        run += s.slice(j, tEnd);
        j = tEnd;
        continue;
      }
      if (isOperand(s[j])) {
        run += s[j++];
        continue;
      }
      if (s[j] === " ") {
        let k = j;
        while (s[k] === " ") k++;
        if (readMathToken(k) > k || (s[k] && isOperand(s[k]))) {
          run += s.slice(j, k);
          j = k;
          continue;
        }
      }
      break;
    }
    out += `$${run.trim()}$`;
    i = j;
  }
  return out;
}

function normalizeMathDelimiters(input: string): string {
  const withDelims = input
    .replace(/\\\$/g, LITERAL_DOLLAR)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, x) => `$$${x}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, x) => `$${x}$`);
  return autoWrapBareLatex(withDelims);
}

interface MathProseProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /**
   * The model output for some fields (e.g. a step's `body`) legitimately
   * mixes inline HTML emphasis tags (<b>, <i>) with $...$ LaTeX per this
   * tool's own prompt instructions. When set, non-math segments are rendered
   * through sanitizeHtml() (DOMPurify) instead of as plain text, so those
   * tags render instead of showing up literally. Leave unset for fields that
   * are plain text/LaTeX only (question, answer, formula) to avoid any HTML
   * interpretation there.
   */
  allowHtml?: boolean;
}

export const MathProse: FC<MathProseProps> = ({ text, className, style, allowHtml, id }) => {
  const normalized = normalizeMathDelimiters(text || "");
  // Split on $$...$$ (block) and $...$ (inline), keeping the delimiters.
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return (
    <span id={id} className={className} style={style}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={i} tex={part.slice(2, -2)} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <InlineMath key={i} tex={part.slice(1, -1)} />;
        }
        // Restore any protected literal dollar signs.
        const restored = part.split(LITERAL_DOLLAR).join("$");
        if (allowHtml) {
          return <span key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(restored) }} />;
        }
        return <span key={i}>{restored}</span>;
      })}
    </span>
  );
};

export default MathProse;
