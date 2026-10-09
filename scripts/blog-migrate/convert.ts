// Converts a rendered WordPress/Elementor blog post page into blog blocks.
// Pure (no network/DB) so it can be unit tested against saved HTML.
import { load, type CheerioAPI, type Cheerio } from "cheerio";
import type { AnyNode, Element } from "domhandler";
import type { FeatureIcon, HeroCta } from "@/app/lib/blog/types";

export type RawBlock = Record<string, unknown> & { type: string };

export type ConvertedPage = {
  blocks: RawBlock[];
  heroVideoUrl: string;
  heroCta: HeroCta | null;
  finalCta: HeroCta | null;
  author: { name: string; wpSlug: string | null } | null;
  views: number;
  warnings: string[];
};

const SKIP_WIDGETS = new Set([
  "html", // table of contents script
  "shortcode",
  "share-buttons",
  "posts.classic",
  "posts.cards",
  "form",
  "author-box",
  "breadcrumbs",
]);
const CTA_WIDGETS = new Set(["heading", "text-editor", "button", "icon-list"]);

const ICONS: [RegExp, FeatureIcon][] = [
  [/check/, "check"],
  [/clock|hourglass|stopwatch/, "clock"],
  [/book|graduation/, "book"],
  [/bullseye|crosshairs/, "target"],
  [/shield|lock/, "shield"],
  [/lightbulb/, "lightbulb"],
  [/chart|signal/, "chart"],
  [/star/, "star"],
];

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function widgetType($el: Cheerio<Element>): string {
  return ($el.attr("data-widget_type") || "").replace(/\.default$/, "");
}

/** Elementor's optimized markup drops .elementor-widget-container; support both. */
function widgetBody($: CheerioAPI, $w: Cheerio<Element>): Cheerio<Element> {
  const inner = $w.children(".elementor-widget-container");
  return inner.length ? inner : $w;
}

function hiddenEverywhere($el: Cheerio<Element>): boolean {
  return ["desktop", "tablet", "mobile"].every((d) => $el.hasClass(`elementor-hidden-${d}`));
}

/** Widgets inside a container, ignoring anything in fully hidden containers. */
function visibleWidgets($: CheerioAPI, $c: Cheerio<Element>): Cheerio<Element> {
  return $c.find("[data-element_type=widget]").filter((_, w) => {
    return !$(w)
      .parentsUntil($c)
      .toArray()
      .some((p) => hiddenEverywhere($(p as Element)));
  });
}

function buttonOf($: CheerioAPI, $scope: Cheerio<Element>) {
  const a = $scope.find(".elementor-widget-button a").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href !== "" && href !== "#";
  }).first();
  return a.length ? { label: clean(a.text()), url: a.attr("href") || "" } : null;
}

/** With allowNoLink, a CTA whose button has no link keeps its heading/text and drops the button. */
function ctaFrom($: CheerioAPI, $c: Cheerio<Element>, allowNoLink = false): HeroCta | null {
  const widgets = visibleWidgets($, $c);
  const headings = widgets.filter((_, w) => widgetType($(w)) === "heading");
  const button = buttonOf($, $c) ?? (allowNoLink ? { label: "", url: "" } : null);
  if (!headings.length || !button) return null;
  const textEditor = widgets.filter((_, w) => widgetType($(w)) === "text-editor").first();
  const text = textEditor.length ? clean(textEditor.text()) : headings.length > 1 ? clean($(headings[1]).text()) : "";
  return { heading: clean($(headings[0]).text()), text, buttonLabel: button.label, buttonUrl: button.url };
}

class Emitter {
  blocks: RawBlock[] = [];
  private html: string[] = [];
  html_(fragment: string) {
    if (fragment.trim()) this.html.push(fragment);
  }
  block(b: RawBlock) {
    this.flush();
    this.blocks.push(b);
  }
  /** Removes and returns the text of a trailing lone heading, e.g. "Frequently Asked Questions". */
  popTrailingHeading(): string | null {
    const last = this.html[this.html.length - 1];
    const m = last?.match(/^<h[2-4]>([\s\S]*?)<\/h[2-4]>$/);
    if (!m) return null;
    this.html.pop();
    return m[1].replace(/<[^>]+>/g, "").trim();
  }
  flush() {
    if (this.html.length) this.blocks.push({ type: "richText", html: this.html.join("\n") });
    this.html = [];
  }
}

function headingHtml(tag: string, inner: string): string {
  const t = tag.toLowerCase();
  const level = t === "h1" || t === "h2" ? "h2" : t === "h3" ? "h3" : /^h[4-6]$/.test(t) ? "h4" : null;
  return level ? `<${level}>${inner}</${level}>` : `<p><strong>${inner}</strong></p>`;
}

function featureIcon($: CheerioAPI, $box: Cheerio<Element>): FeatureIcon {
  const cls = $box.find(".elementor-icon svg, .elementor-icon i").attr("class") || "";
  return ICONS.find(([re]) => re.test(cls))?.[1] ?? "star";
}

function handleContainer($: CheerioAPI, $c: Cheerio<Element>, out: Emitter, warnings: string[]) {
  if (hiddenEverywhere($c)) return;
  const widgets = visibleWidgets($, $c);
  const types = widgets.toArray().map((w) => widgetType($(w)));
  if (!types.length) return;

  if (types.every((t) => t === "icon-box")) {
    const boxes = widgets.toArray().map((w) => $(w));
    if (boxes.some((b) => b.find(".elementor-icon").length)) {
      out.block({
        type: "featureGrid",
        items: boxes.map((b) => ({
          icon: featureIcon($, b),
          title: clean(b.find(".elementor-icon-box-title").text()),
          text: clean(b.find(".elementor-icon-box-description").text()),
        })),
      });
    } else {
      warnings.push(`skipped static stats strip (${boxes.map((b) => clean(b.text())).join(", ").slice(0, 80)})`);
    }
    return;
  }

  if (types.every((t) => t === "image-box")) {
    out.block({
      type: "linkCards",
      items: widgets.toArray().map((w) => {
        const $w = $(w);
        return {
          imageUrl: $w.find("img").attr("src") || "",
          title: clean($w.find(".elementor-image-box-title").text()),
          url: $w.find("a").attr("href") || "",
        };
      }),
    });
    return;
  }

  const isCta = types.includes("heading") && types.includes("button") && types.every((t) => CTA_WIDGETS.has(t)) && types.length <= 6;
  if (isCta) {
    const cta = ctaFrom($, $c);
    if (!cta) {
      warnings.push(`skipped CTA with no working link ("${clean(widgets.filter((_, w) => widgetType($(w)) === "heading").first().text())}")`);
      return;
    }
    const bullets = widgets
      .filter((_, w) => widgetType($(w)) === "icon-list")
      .find(".elementor-icon-list-text")
      .toArray()
      .map((li) => clean($(li).text()));
    out.block({ type: "cta", ...cta, ...(bullets.length ? { bullets } : {}) });
    return;
  }

  walkChildren($, $c, out, warnings);
}

function handleWidget($: CheerioAPI, $w: Cheerio<Element>, out: Emitter, warnings: string[]) {
  const type = widgetType($w);
  const body = widgetBody($, $w);
  if (SKIP_WIDGETS.has(type)) return;
  switch (type) {
    case "theme-post-featured-image":
      // The template renders the featured image after the first block, so end the intro block here.
      out.flush();
      return;
    case "heading": {
      const h = body.find(".elementor-heading-title").first();
      out.html_(headingHtml(h.prop("tagName") || "p", h.html() || ""));
      return;
    }
    case "text-editor":
      out.html_(body.html() || "");
      return;
    case "theme-post-content":
      walkChildren($, body, out, warnings);
      return;
    case "image": {
      const img = body.find("img").first();
      if (img.attr("src")) {
        out.block({ type: "image", url: img.attr("src"), alt: img.attr("alt") || "", caption: clean(body.find("figcaption").text()) });
      }
      return;
    }
    case "icon-list": {
      const items = body.find(".elementor-icon-list-text").toArray().map((li) => `<li>${$(li).html()}</li>`);
      if (items.length) out.html_(`<ul>${items.join("")}</ul>`);
      return;
    }
    case "button": {
      const a = body.find("a").first();
      const href = a.attr("href");
      if (href && href !== "#") out.html_(`<p><a href="${href}">${clean(a.text())}</a></p>`);
      return;
    }
    case "icon-box":
      out.html_(`<p><strong>${clean(body.find(".elementor-icon-box-title").text())}</strong> ${clean(body.find(".elementor-icon-box-description").text())}</p>`);
      return;
    case "elementskit-accordion": {
      const items = body
        .find(".elementskit-card")
        .toArray()
        .map((card) => ({
          question: clean($(card).find(".elementskit-btn-link, .ekit-accordion-title").first().text()),
          answer: clean($(card).find(".elementskit-card-body").first().text()),
        }))
        .filter((i) => i.question && i.answer);
      const title = out.popTrailingHeading() || "Frequently Asked Questions";
      if (items.length) out.block({ type: "faq", title, items });
      return;
    }
    case "video": {
      const url = videoUrl($w);
      if (url) out.block({ type: "video", url });
      return;
    }
    default:
      warnings.push(`unknown widget "${type}" kept as text`);
      if (clean(body.text())) out.html_(`<p>${clean(body.text())}</p>`);
  }
}

function walkChildren($: CheerioAPI, $parent: Cheerio<Element>, out: Emitter, warnings: string[]) {
  $parent.contents().each((_, node: AnyNode) => {
    if (node.type === "text") {
      const t = clean($(node).text());
      if (t) out.html_(`<p>${t}</p>`);
      return;
    }
    if (node.type !== "tag") return;
    const $n = $(node as Element);
    const type = $n.attr("data-element_type");
    if (type === "widget") return handleWidget($, $n, out, warnings);
    if (type === "container" || type === "section" || type === "column") return handleContainer($, $n, out, warnings);
    if ($n.is("[data-elementor-type]") || ($n.find("[data-element_type]").length && $n.is("div,section"))) {
      return walkChildren($, $n, out, warnings);
    }
    if ($n.is("style,script,noscript")) return;
    out.html_($.html($n));
  });
}

function videoUrl($w: Cheerio<Element>): string {
  try {
    const settings = JSON.parse($w.attr("data-settings") || "{}");
    return settings.youtube_url || settings.vimeo_url || "";
  } catch {
    return "";
  }
}

function parseViews(text: string): number {
  const m = clean(text).match(/([\d.,]+)\s*([kKmM]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(/,/g, ""));
  const mult = m[2].toLowerCase() === "k" ? 1000 : m[2].toLowerCase() === "m" ? 1_000_000 : 1;
  return Number.isFinite(n) ? Math.round(n * mult) : 0;
}

export function convertPostPage(html: string): ConvertedPage {
  const $ = load(html);
  const warnings: string[] = [];
  const tpl = $('[data-elementor-type="single-post"]').first();
  if (!tpl.length) throw new Error("Single post template not found in page");
  const top = tpl.children("[data-element_type]");

  // Header: video + call to action
  const hero = top.filter((_, el) => $(el).find(".elementor-widget-theme-post-title").length > 0).first();
  const heroVideoUrl = videoUrl(hero.find(".elementor-widget-video").first());
  const heroButton = hero.find(".elementor-widget-button").first();
  let heroCta: HeroCta | null = null;
  if (heroButton.length) {
    const box = heroButton
      .parents("[data-element_type=container]")
      .filter((_, c) => $(c).find(".elementor-widget-heading").length > 0 && !$(c).find(".elementor-widget-theme-post-title").length)
      .first();
    if (box.length) heroCta = ctaFrom($, box, true);
    if (heroCta && !heroCta.buttonUrl) warnings.push(`header CTA button has no link ("${heroCta.heading}")`);
  }

  // Article column: the row child that contains the post content widget
  const pc = tpl.find(".elementor-widget-theme-post-content").first();
  const row = top.filter((_, el) => $(el).find(pc).length > 0).first();
  const column = row.children("[data-element_type]").filter((_, el) => $(el).find(pc).length > 0).first();
  const out = new Emitter();
  walkChildren($, column, out, warnings);
  out.flush();

  // Closing call to action: a heading + button container after the author box
  let finalCta: HeroCta | null = null;
  const authorIdx = top.toArray().findIndex((el) => $(el).find(".elementor-widget-author-box").length > 0);
  top.slice(authorIdx + 1).each((_, el) => {
    const $el = $(el);
    if (!finalCta && !$el.find(".elementor-widget-posts").length && $el.find(".elementor-widget-button").length) {
      finalCta = ctaFrom($, $el, true);
    }
  });
  const closing = finalCta as HeroCta | null;
  if (closing && !closing.buttonUrl) warnings.push(`closing CTA button has no link ("${closing.heading}")`);

  const authorName = clean($(".elementor-author-box__name").first().text());
  const authorHref = $(".elementor-author-box__button").attr("href") || $(".elementor-author-box a[href*='/author/']").attr("href") || "";
  const wpSlug = authorHref.match(/\/author\/([^/]+)/)?.[1] ?? null;

  const viewsWidget = $(".elementor-widget-shortcode").filter((_, el) => /\d/.test($(el).text())).first();

  return {
    blocks: out.blocks,
    heroVideoUrl,
    heroCta,
    finalCta,
    author: authorName ? { name: authorName, wpSlug } : null,
    views: viewsWidget.length ? parseViews(viewsWidget.text()) : 0,
    warnings,
  };
}

/** Visible text of the article column, for word-count comparison in the report. */
export function columnText(html: string): string {
  const $ = load(html);
  const tpl = $('[data-elementor-type="single-post"]').first();
  const pc = tpl.find(".elementor-widget-theme-post-content").first();
  const row = tpl.children("[data-element_type]").filter((_, el) => $(el).find(pc).length > 0).first();
  const column = row.children("[data-element_type]").filter((_, el) => $(el).find(pc).length > 0).first().clone();
  column.find("[class*='elementor-hidden-desktop'][class*='elementor-hidden-mobile'], script, style").remove();
  return clean(column.text());
}
