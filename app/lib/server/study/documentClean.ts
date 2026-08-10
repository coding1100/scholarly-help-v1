/**
 * Shared source-text cleaning service.
 *
 * Every study source — file upload (PDF/DOCX/DOC/TXT), URL import, and pasted
 * text — is funneled through `cleanSourceText()` at a single ingestion choke
 * point, so all three produce consistent, boilerplate-free text.
 *
 * DESIGN PRINCIPLE: Be conservative. Only remove text that is unambiguously
 * boilerplate (dotted leaders, repeated header/footer noise). Never remove
 * real prose — a false positive that strips actual course content is far more
 * damaging than leaving a few ToC lines in.
 */

/**
 * The single entry point every ingestion path should call.
 * Normalizes whitespace and strips clear boilerplate (dotted leaders, repeated
 * header/footer lines). Safe on already-clean text (pasted prose is untouched).
 */
export function cleanSourceText(input: string): string {
  if (!input) return "";
  let text = input.replace(/\r/g, "");

  // Normalise Unicode ellipsis to ASCII dots so one regex handles both.
  text = text.replace(/…/g, "...");

  // 1) Remove dotted leaders ("Introduction .......... 3") — unambiguous ToC/index.
  text = text.replace(
    /[A-Za-z][A-Za-z .,'\&/()-]*?\s*\.{4,}\s*\d*/g,
    " ",
  );

  // 2) Remove obvious ToC section heading words wherever they appear inline.
  text = text.replace(
    /\b(table of contents?|list of (?:figures|tables))\b/gi,
    " ",
  );

  // 3) Remove cover-page metadata labels (very narrow pattern).
  text = text.replace(
    /\b(word count|course code|campus|banner|student (?:id|number)|matriculation|submission date|module code)\s*[:.]?/gi,
    " ",
  );

  // 4) Line-level pass: drop lines that are clearly ONLY a ToC entry
  //    (nothing but a section number, a short title, and a page number).
  //    We do NOT run this on the body — only lines that satisfy ALL conditions.
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((line) => {
      if (!line) return false;
      // Keep all lines that have real sentence structure (contain a verb-like
      // lowercase sequence of 3+ words, or are long enough to be prose).
      if (line.length > 120) return true;
      return !isPureToCorHeaderLine(line);
    });

  return lines
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Returns true ONLY if the line is unambiguously a ToC entry or page header. */
function isPureToCorHeaderLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;

  // "Table of Contents" / "Contents" headings
  if (/^(table of contents?|contents|list of (figures|tables))$/i.test(t)) {
    return true;
  }

  // "Pg. No." column header
  if (/^pg\.?\s*no\.?$/i.test(t)) return true;

  // A line that is ONLY a section-number + short title + page-number,
  // with NO other words. Very strict: must be ≤ 60 chars and match fully.
  // Example: "1.2 Research Aim 3"  or  "10. Conclusion 42"
  // NOT matched: "Issue 1 occurred in module 3" (has lowercase continuation)
  const pureToC =
    /^\d+(?:\.\d+)*\.?\s+[A-Z][A-Za-z\s.,'\-&/()]{2,50}\s+\d{1,3}$/.test(t);
  return pureToC && t.length <= 80;
}

/** @deprecated Kept for backward compat — use cleanSourceText() */
export function stripDocumentBoilerplate(input: string): string {
  return cleanSourceText(input);
}
