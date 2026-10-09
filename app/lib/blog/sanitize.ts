import sanitizeHtml from "sanitize-html";

// Rich text produced by the Tiptap editor (or converted from WordPress).
// Anything outside this list is dropped, so stored HTML is safe to render.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s",
    "a", "ul", "ol", "li", "blockquote", "code", "pre", "mark",
    "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    "*": ["id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  // Drop empty paragraphs (the editor leaves a trailing <p></p>), but keep ones holding an image.
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && frame.mediaChildren.length === 0,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?scholarlyhelp\.com/i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : { href, ...(attribs.id ? { id: attribs.id } : {}) },
      };
    },
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html || "", RICH_TEXT_OPTIONS).trim();
}

/** Strips all markup; used for plain-text fields (titles, comments, FAQ text). */
export function toPlainText(value: unknown, maxLength = 10_000): string {
  if (typeof value !== "string") return "";
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, maxLength);
}

/** Accepts only absolute http(s) URLs or site-relative paths; anything else becomes "". */
export function safeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}
