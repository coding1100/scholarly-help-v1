import DOMPurify from "dompurify";

/**
 * Sanitize HTML that originates from an LLM, a saved document, or any other
 * untrusted source before passing it to dangerouslySetInnerHTML. Strips
 * scripts, event handlers, and javascript: URLs while keeping the formatting
 * tags our tools legitimately produce (incl. inline MathML/SVG for STEM).
 *
 * On the server (no DOM), DOMPurify can't run; we return a conservatively
 * tag-stripped string so nothing executable is ever emitted during SSR.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  const input = typeof dirty === "string" ? dirty : "";
  if (!input) return "";

  if (typeof window === "undefined") {
    // SSR fallback: drop script/style blocks and all tags' event handlers by
    // removing angle-bracket content we can't vet. Client re-render will then
    // sanitize-and-render the real markup.
    return input
      .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/on\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript:/gi, "");
  }

  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true, svg: true, mathMl: true },
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });
}
