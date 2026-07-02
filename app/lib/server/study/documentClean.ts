/**
 * Shared source-text cleaning service.
 *
 * Every study source — file upload (PDF/DOCX/DOC/TXT), URL import, and pasted
 * text — is funneled through `cleanSourceText()` at a single ingestion choke
 * point, so all three produce consistent, boilerplate-free text.
 *
 * Extracted documents frequently begin with a cover page and a table of contents
 * ("Abstract .......... 1  1. Introduction 2  1.1 Rationale 2 …"). That ToC is
 * not content — but it's the most repetitive, keyword-dense text in the file, so
 * summarizers latch onto it. This removes it (and dotted leaders, cover-page
 * metadata, page-number columns) before the text is stored or summarized.
 *
 * Conservative by design: it only removes text that strongly matches ToC / cover
 * signatures, so real prose is preserved.
 */

/**
 * The single entry point every ingestion path should call. Normalizes and
 * strips document boilerplate. Safe on already-clean text (e.g. pasted prose):
 * it only removes strong ToC/cover signatures, so ordinary text is untouched.
 */
export function cleanSourceText(input: string): string {
  return stripDocumentBoilerplate(input);
}

// Dotted leaders: "Abstract ............... 11" or "…… 16". A hallmark of a ToC.
const DOTTED_LEADER = /\s*\.{4,}\s*\d*/g;

// A single ToC entry like "1.2 Research Aim 3", "3. Methodology 7",
// "10.3 Draft Questionnaire Structure 16". Number, title words, trailing page no.
// Allows an optional space after the section number ("8.Implications") which some
// exporters drop.
const TOC_ENTRY =
  /\b\d+(?:\.\d+)*\.?\s*[A-Z][A-Za-z][A-Za-z .,'&/()-]*?\s+\d{1,3}\b/g;


// Cover-page metadata fragments (kept minimal to avoid touching prose).
const COVER_METADATA =
  /\b(word count|course code|campus|session|banner|student (?:id|number)|matriculation|submission date|module code)\s*[:.]?/gi;

/**
 * Remove the leading table-of-contents / cover block and any dotted-leader
 * lines, then return the remaining prose.
 */
export function stripDocumentBoilerplate(input: string): string {
  if (!input) return input;
  let text = input.replace(/\r/g, "");

  // Leaders come in two flavours depending on the exporter: runs of ASCII dots
  // ("......") or runs of Unicode ellipsis chars ("………", U+2026). Normalise the
  // ellipsis form to dots FIRST so every later pattern only deals with dots.
  text = text.replace(/…/g, "...");

  // 1) Kill dotted leaders, together with the entry title that precedes them
  //    ("10.3 Draft Questionnaire Structure ....... 16" → removed). Handling the
  //    title here prevents an orphaned, page-number-less entry surviving later.
  text = text.replace(
    /\b(?:\d+(?:\.\d+)*\.?\s*)?[A-Za-z][A-Za-z .,'&/()-]*?\s*\.{4,}\s*\d*/g,
    " ",
  );
  // Any remaining bare dotted leaders.
  text = text.replace(DOTTED_LEADER, " ");

  // 2) Remove ToC section headers wherever they appear inline.
  text = text.replace(
    /\b(table of contents?|contents\b|pg\.?\s*no\.?|list of (?:figures|tables))/gi,
    " ",
  );

  // 3) Remove runs of consecutive ToC entries (a chain of "N.N Title <page>" is
  //    a table of contents, never a real sentence). Two passes: first collapse
  //    dense runs (3+), then mop up shorter runs/stragglers (2+) that become
  //    adjacent once their neighbours are gone. Iterate until stable so a long
  //    single-line ToC (common in DOCX exports) is fully removed.
  const denseRun = new RegExp(`(?:${TOC_ENTRY.source}[\\s,;]*){3,}`, "g");
  const shortRun = new RegExp(`(?:${TOC_ENTRY.source}[\\s,;]*){2,}`, "g");
  text = text.replace(denseRun, " ");
  for (let i = 0; i < 4; i += 1) {
    const before = text;
    text = text.replace(shortRun, " ").replace(TOC_ENTRY, " ");
    if (text === before) break;
  }

  // 4) Drop cover-page metadata labels.
  text = text.replace(COVER_METADATA, " ");

  // 5) Line-level pass: remove any residual line that is still mostly ToC/nav.
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line && !isTocLine(line));

  return lines
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isTocLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  // "Table of Content" / "Contents" headers.
  if (/^(table of contents?|contents|list of (figures|tables))\b/i.test(t)) {
    return true;
  }
  // A line that is largely ToC entries and lacks real sentence flow.
  const entries = t.match(TOC_ENTRY);
  if (entries && entries.length >= 3) {
    // If removing the entries leaves almost nothing, it was a pure ToC line.
    const remainder = t.replace(TOC_ENTRY, "").replace(/[\s,;.]/g, "");
    if (remainder.length < t.length * 0.3) return true;
  }
  // A bare "Pg.No" / page-number column header.
  if (/^pg\.?\s*no\.?$/i.test(t)) return true;
  return false;
}
