import * as cheerio from "cheerio";

/**
 * Extract the useful article text from an HTML page, discarding navigation,
 * sidebars, tables of contents, language lists, references, footers, and any
 * embedded script/style/JSON.
 *
 * Uses cheerio (a real HTML parser) with Readability-style heuristics rather
 * than regex, so it holds up on complex real-world pages (Wikipedia, docs,
 * blogs). The goal is "reader mode": keep the prose a human would actually
 * read, drop the page chrome.
 */

// Elements that are never article content — removed with their subtree.
const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "nav",
  "header",
  "footer",
  "aside",
  "form",
  "button",
  "input",
  "select",
  "textarea",
  "figure figcaption",
  "iframe",
  "link",
  "meta",
  // ARIA landmarks that are never main content.
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="search"]',
  '[role="complementary"]',
  '[aria-hidden="true"]',
  // Wikipedia / MediaWiki specific chrome.
  "#mw-navigation",
  "#mw-panel",
  "#p-lang",
  "#footer",
  "#siteNotice",
  "#contentSub",
  ".mw-editsection",
  ".mw-jump-link",
  ".navbox",
  ".vertical-navbox",
  ".infobox",
  ".sidebar",
  ".toc",
  "#toc",
  ".toctitle",
  ".reference",
  ".reflist",
  ".references",
  ".mw-references-wrap",
  ".catlinks",
  ".printfooter",
  ".hatnote",
  ".shortdescription",
  ".noprint",
  ".metadata",
  ".ambox",
  ".portal",
  "#p-personal",
  ".language-list",
  ".interlanguage-link",
  ".mw-portlet",
  ".vector-menu",
  ".vector-toc",
  ".mw-list-item",
  "sup.reference",
].join(", ");

// class/id substrings that mark a generic container as boilerplate.
const BOILERPLATE_ATTR =
  /(^|[\s_-])(nav|navbar|menu|sidebar|toc|breadcrumb|footer|header|masthead|banner|cookie|consent|comment|related|recirc|promo|advert|\bads?\b|social|share|sharing|subscribe|newsletter|pagination|paginate|skip|sr-only|screen-reader|infobox|metadata|reference|reflist|catlink|noprint|hatnote|lang-list|language|interlanguage|site-notice|editsection)/i;

// Candidate containers for the main article, best first.
const MAIN_SELECTORS = [
  "#mw-content-text .mw-parser-output", // Wikipedia article body
  "#mw-content-text",
  "main",
  "article",
  '[role="main"]',
  "#content",
  "#main",
  ".post-content",
  ".article-content",
  ".entry-content",
];

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Reject residual lines that are clearly ToC/menu/reference noise even after
 * structural removal (some pages inline these as plain paragraphs).
 */
function isNoiseLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (t.length < 3) return true;
  // Reference-only lines like "[ 21 ] : 488" or bare "^ Jump up".
  if (/^\[?\s*\d+\s*\]?(\s*:\s*\d+)?$/.test(t)) return true;
  if (/^\^/.test(t)) return true;
  // Nav/reader chrome.
  if (
    /^(jump to|toggle|move to sidebar|hide|show|\(top\)|edit|view source|from wikipedia|retrieved from|main menu|navigation|personal tools|contents)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  // Dotted-leader ToC lines ("Abstract ....... 11").
  if (/\.{4,}\s*\d*\s*$/.test(t)) return true;
  // A line that is mostly "N.N Title" ToC entries and contains no real sentence.
  const tocEntries = t.match(/\b\d+(\.\d+)*\s+[A-Z][A-Za-z-]*/g);
  if (tocEntries && tocEntries.length >= 4 && !/[.!?]\s/.test(t)) return true;
  return false;
}

export function extractReadableTextFromHtml(html: string): string {
  const $ = cheerio.load(html);
  type Selection = ReturnType<typeof $>;

  // 1) Strip known non-content elements entirely.
  $(STRIP_SELECTORS).remove();

  // 2) Strip generic containers whose class/id looks like boilerplate.
  $("[class], [id]").each((_i, el) => {
    const node = $(el);
    const attr = `${node.attr("class") || ""} ${node.attr("id") || ""}`;
    if (BOILERPLATE_ATTR.test(attr)) node.remove();
  });

  // 3) Pick the main content region if the page marks one; else fall back to body.
  let root: Selection | null = null;
  for (const selector of MAIN_SELECTORS) {
    const candidate = $(selector).first();
    if (candidate.length && candidate.text().trim().length > 400) {
      root = candidate;
      break;
    }
  }
  const scope = root ?? $("body");

  // 4) Pull text from block-level content nodes, preserving paragraph breaks.
  const blocks: string[] = [];
  scope
    .find("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, dd, dt")
    .each((_i, el) => {
      const text = $(el)
        .text()
        .replace(/\[\s*\d+\s*\]/g, "") // inline ref markers like [21]
        .replace(/\[\s*edit\s*\]/gi, "")
        .trim();
      if (text) blocks.push(text);
    });

  // Fallback: if the page had no block structure, use the scope's raw text.
  const rawBlocks =
    blocks.length > 0 ? blocks : [scope.text()];

  const cleaned = rawBlocks
    .map((b) => normalizeWhitespace(b))
    .filter((b) => b && !isNoiseLine(b));

  // De-duplicate consecutive identical lines (nav items often repeat).
  const deduped: string[] = [];
  for (const line of cleaned) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }

  return normalizeWhitespace(deduped.join("\n\n"));
}
