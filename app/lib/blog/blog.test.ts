import { describe, expect, it } from "vitest";
import { safeUrl, sanitizeRichText, toPlainText } from "./sanitize";
import { normalizeBlock, normalizePostInput, ValidationError } from "./validate";
import { buildToc, formatViews, isPostLive, readingTimeMinutes, resolveLeadForms, slugify, youtubeId } from "./utils";
import { normalizePostLeadForms, normalizeSettingsInput } from "./validate";
import { DEFAULT_BLOG_SETTINGS } from "./types";
import type { BlogBlock } from "./types";

describe("sanitizeRichText", () => {
  it("removes scripts, event handlers and unsafe links", () => {
    const html = sanitizeRichText(
      '<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="x" onerror="y()">',
    );
    expect(html).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(html).toContain("<p>Hi</p>");
  });

  it("keeps allowed formatting and tables", () => {
    const html = sanitizeRichText("<h2>T</h2><ul><li><strong>a</strong></li></ul><table><tbody><tr><td>1</td></tr></tbody></table>");
    expect(html).toBe("<h2>T</h2><ul><li><strong>a</strong></li></ul><table><tbody><tr><td>1</td></tr></tbody></table>");
  });

  it("drops empty paragraphs but keeps image paragraphs", () => {
    expect(sanitizeRichText('<p>a</p><p></p><p>  </p><p><img src="https://x.com/i.png" alt=""></p>')).toBe(
      '<p>a</p><p><img src="https://x.com/i.png" alt="" /></p>',
    );
  });

  it("opens external links in a new tab safely, leaves internal links alone", () => {
    expect(sanitizeRichText('<a href="https://example.com">x</a>')).toContain('rel="noopener noreferrer"');
    expect(sanitizeRichText('<a href="/homework/" target="_blank">x</a>')).toBe('<a href="/homework/">x</a>');
    expect(sanitizeRichText('<a href="https://scholarlyhelp.com/exam/">x</a>')).toBe('<a href="https://scholarlyhelp.com/exam/">x</a>');
  });
});

describe("safeUrl / toPlainText", () => {
  it("accepts http(s) and site paths only", () => {
    expect(safeUrl("https://a.com/x")).toBe("https://a.com/x");
    expect(safeUrl("/take-my-class/")).toBe("/take-my-class/");
    expect(safeUrl("javascript:alert(1)")).toBe("");
    expect(safeUrl("//evil.com")).toBe("");
    expect(safeUrl(42)).toBe("");
  });

  it("strips markup from plain fields", () => {
    expect(toPlainText("<b>Hi</b> & bye")).toBe("Hi & bye");
    expect(toPlainText("abcdef", 3)).toBe("abc");
  });
});

describe("normalizePostInput", () => {
  it("requires a title and derives a slug", () => {
    expect(() => normalizePostInput({})).toThrow(ValidationError);
    const post = normalizePostInput({ title: "Study Tips & Guides!" });
    expect(post.slug).toBe("study-tips-guides");
    expect(post.status).toBe("draft");
    expect(post.publishAt).toBeNull();
  });

  it("rejects reserved slugs used by archive routes", () => {
    expect(() => normalizePostInput({ title: "x", slug: "category" })).toThrow(/reserved/);
  });

  it("sets publishAt when publishing without a date", () => {
    const post = normalizePostInput({ title: "x", status: "published" });
    expect(post.publishAt).not.toBeNull();
  });

  it("drops invalid ids, unknown blocks and empty CTAs", () => {
    const post = normalizePostInput({
      title: "x",
      categoryId: "bad id with spaces",
      tagIds: ["ok-1", { $ne: 1 }],
      blocks: [{ type: "unknown" }, { type: "richText", html: "" }, { type: "richText", html: "<p>a</p>" }],
      heroCta: { heading: "", buttonLabel: "" },
    });
    expect(post.categoryId).toBeNull();
    expect(post.tagIds).toEqual(["ok-1"]);
    expect(post.blocks).toHaveLength(1);
    expect(post.heroCta).toBeNull();
  });
});

describe("normalizeBlock", () => {
  it("falls back to a valid icon and blanks unsafe CTA links", () => {
    const grid = normalizeBlock({ type: "featureGrid", items: [{ icon: "evil", title: "A", text: "" }] });
    expect(grid).toMatchObject({ type: "featureGrid", items: [{ icon: "star", title: "A" }] });
    const cta = normalizeBlock({ type: "cta", heading: "Go", buttonLabel: "Click", buttonUrl: "javascript:alert(1)" });
    expect(cta).toMatchObject({ type: "cta", buttonUrl: "" });
  });

  it("keeps only complete FAQ items", () => {
    const faq = normalizeBlock({ type: "faq", items: [{ question: "Q", answer: "" }, { question: "Q2", answer: "A2" }] });
    expect(faq).toMatchObject({ items: [{ question: "Q2", answer: "A2" }] });
  });
});

describe("utils", () => {
  it("isPostLive respects status and schedule", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    expect(isPostLive({ status: "draft", publishAt: "2025-01-01T00:00:00Z" }, now)).toBe(false);
    expect(isPostLive({ status: "published", publishAt: "2026-01-02T00:00:00Z" }, now)).toBe(false);
    expect(isPostLive({ status: "published", publishAt: "2025-12-31T00:00:00Z" }, now)).toBe(true);
    expect(isPostLive({ status: "published", publishAt: null }, now)).toBe(false);
  });

  it("buildToc adds unique heading ids and anchors titled blocks", () => {
    const blocks: BlogBlock[] = [
      { id: "a", type: "richText", html: "<h2>Intro</h2><p>x</p><h2>Intro</h2>" },
      { id: "b", type: "faq", title: "FAQ", items: [{ question: "q", answer: "a" }] },
    ];
    const { blocks: out, toc, anchors } = buildToc(blocks);
    expect(toc.map((t) => t.id)).toEqual(["intro", "intro-2", "faq"]);
    expect((out[0] as { html: string }).html).toContain('<h2 id="intro-2">Intro</h2>');
    expect(anchors.b).toBe("faq");
  });

  it("parses YouTube URLs", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://vimeo.com/123")).toBeNull();
  });

  it("formats views like the WordPress counter", () => {
    expect(formatViews(999)).toBe("999");
    expect(formatViews(10089)).toBe("10.089k");
    expect(formatViews(2000)).toBe("2k");
  });

  it("slugify and reading time", () => {
    expect(slugify("  Héllo,  World! ")).toBe("hello-world");
    expect(readingTimeMinutes([{ id: "a", type: "richText", html: `<p>${"word ".repeat(440)}</p>` }])).toBe(2);
  });
});

describe("lead forms", () => {
  const defaults = DEFAULT_BLOG_SETTINGS.leadForms;

  it("post overrides keep only filled fields and strip markup", () => {
    expect(normalizePostLeadForms({ inline: { heading: "<b>Get a stats tutor</b>", highlight: "stats tutor", text: "" }, sidebar: { text: " " } })).toEqual({
      inline: { heading: "Get a stats tutor", highlight: "stats tutor" },
    });
    expect(normalizePostLeadForms({ hidden: true })).toEqual({ hidden: true });
    expect(normalizePostLeadForms(undefined)).toEqual({});
  });

  it("settings fall back to the default text when a field is cleared", () => {
    const s = normalizeSettingsInput({ leadForms: { enabled: true, inline: { heading: "", buttonLabel: "Book now" }, sidebar: {} } });
    expect(s.leadForms.inline.heading).toBe(defaults.inline.heading);
    expect(s.leadForms.inline.buttonLabel).toBe("Book now");
    expect(s.leadForms.inline.highlight).toBe(""); // a cleared highlight stays cleared
    expect(s.leadForms.sidebar).toEqual({ ...defaults.sidebar, highlight: "" });
  });

  it("resolves per-post text on top of the defaults, or hides the forms", () => {
    const resolved = resolveLeadForms(defaults, { leadForms: { inline: { heading: "Get a stats tutor", highlight: "stats tutor" } } });
    expect(resolved?.inline).toEqual({ ...defaults.inline, heading: "Get a stats tutor", highlight: "stats tutor" });
    expect(resolved?.sidebar).toEqual(defaults.sidebar);
    expect(resolveLeadForms(defaults, { leadForms: { hidden: true } })).toBeNull();
    expect(resolveLeadForms({ ...defaults, enabled: false }, {})).toBeNull();
  });
});
