import type { BlogBlock, BlogPost } from "./types";

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** A post is publicly visible once published and its publish time has passed. */
export function isPostLive(post: Pick<BlogPost, "status" | "publishAt">, now = new Date()): boolean {
  if (post.status !== "published" || !post.publishAt) return false;
  return new Date(post.publishAt).getTime() <= now.getTime();
}

export function liveFilter(now = new Date()) {
  return { status: "published" as const, publishAt: { $lte: now.toISOString() } };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

export function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "richText":
      return stripTags(block.html);
    case "featureGrid":
      return [block.title, ...block.items.flatMap((i) => [i.title, i.text])].join(" ");
    case "cta":
      return [block.heading, block.text].join(" ");
    case "faq":
      return [block.title, ...block.items.flatMap((i) => [i.question, i.answer])].join(" ");
    case "image":
      return block.caption || "";
    case "linkCards":
      return block.items.map((i) => i.title).join(" ");
    default:
      return "";
  }
}

export function readingTimeMinutes(blocks: BlogBlock[]): number {
  const words = blocks.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export type TocItem = { id: string; text: string };

/**
 * Gives every <h2> in rich-text blocks a stable id and returns the table of contents.
 * Feature grid and FAQ titles are included too, matching the WordPress template.
 */
export function buildToc(blocks: BlogBlock[]): {
  blocks: BlogBlock[];
  toc: TocItem[];
  /** Anchor id per titled (non rich-text) block id. */
  anchors: Record<string, string>;
} {
  const used = new Set<string>();
  const toc: TocItem[] = [];
  const anchors: Record<string, string> = {};
  const uniqueId = (text: string) => {
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  const out = blocks.map((block) => {
    if (block.type !== "richText") {
      if ((block.type === "faq" || block.type === "featureGrid") && block.title) {
        const id = uniqueId(block.title);
        anchors[block.id] = id;
        toc.push({ id, text: block.title });
      }
      return block;
    }
    const html = block.html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_m, _attrs, inner: string) => {
      const text = stripTags(inner).replace(/\s+/g, " ").trim();
      if (!text) return `<h2>${inner}</h2>`;
      const id = uniqueId(text);
      toc.push({ id, text: decodeEntities(text) });
      return `<h2 id="${id}">${inner}</h2>`;
    });
    return { ...block, html };
  });

  return { blocks: out, toc, anchors };
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Returns the YouTube video id for watch, short, embed and youtu.be URLs. */
export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{6,})/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatPostTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })
    .toLowerCase();
}

export function formatViews(views: number): string {
  // Same style as the former WordPress counter, e.g. 10089 -> "10.089k".
  if (views >= 1000) return `${(views / 1000).toFixed(views >= 100_000 ? 0 : 3).replace(/\.?0+$/, "")}k`;
  return String(views);
}

export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com").replace(/\/+$/, "");
}

export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}
