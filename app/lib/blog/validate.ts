import { randomUUID } from "crypto";
import { safeUrl, sanitizeRichText, toPlainText } from "./sanitize";
import { slugify } from "./utils";
import {
  DEFAULT_BLOG_SETTINGS,
  type BlogBlock,
  type BlogPost,
  type BlogSettings,
  type FeatureIcon,
  type HeroCta,
  type LeadFormContent,
  type PostLeadForms,
  type PostSeo,
} from "./types";

export class ValidationError extends Error {}

const FEATURE_ICONS: FeatureIcon[] = [
  "star", "check", "clock", "book", "target", "shield", "lightbulb", "chart",
];

const str = (v: unknown, max = 500) => toPlainText(v, max);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

function normalizeCta(value: unknown): HeroCta | null {
  const o = obj(value);
  const heading = str(o.heading, 200);
  const buttonLabel = str(o.buttonLabel, 80);
  const buttonUrl = safeUrl(o.buttonUrl);
  if (!heading && !buttonLabel) return null;
  return { heading, text: str(o.text, 600), buttonLabel, buttonUrl };
}

const LEAD_FIELDS: { key: keyof LeadFormContent; max: number }[] = [
  { key: "heading", max: 150 },
  { key: "highlight", max: 80 },
  { key: "text", max: 300 },
  { key: "buttonLabel", max: 40 },
  { key: "note", max: 120 },
];

function normalizeLeadContent(value: unknown): LeadFormContent {
  const o = obj(value);
  return Object.fromEntries(LEAD_FIELDS.map(({ key, max }) => [key, str(o[key], max)])) as LeadFormContent;
}

/** Keeps only the override fields that were filled in. */
function normalizeLeadOverride(value: unknown): Partial<LeadFormContent> | undefined {
  const content = normalizeLeadContent(value);
  const filled = Object.fromEntries(Object.entries(content).filter(([, v]) => v));
  return Object.keys(filled).length ? filled : undefined;
}

export function normalizePostLeadForms(value: unknown): PostLeadForms {
  const o = obj(value);
  const out: PostLeadForms = {};
  if (o.hidden === true) out.hidden = true;
  const inline = normalizeLeadOverride(o.inline);
  const sidebar = normalizeLeadOverride(o.sidebar);
  if (inline) out.inline = inline;
  if (sidebar) out.sidebar = sidebar;
  return out;
}

export function normalizeBlock(value: unknown): BlogBlock | null {
  const o = obj(value);
  const id = typeof o.id === "string" && /^[\w-]{1,64}$/.test(o.id) ? o.id : randomUUID();
  switch (o.type) {
    case "richText": {
      const html = sanitizeRichText(typeof o.html === "string" ? o.html : "");
      return html ? { id, type: "richText", html } : null;
    }
    case "image": {
      const url = safeUrl(o.url);
      return url ? { id, type: "image", url, alt: str(o.alt, 300), caption: str(o.caption, 300) } : null;
    }
    case "featureGrid": {
      const items = arr(o.items)
        .map((i) => {
          const it = obj(i);
          const icon = FEATURE_ICONS.includes(it.icon as FeatureIcon) ? (it.icon as FeatureIcon) : "star";
          return { icon, title: str(it.title, 150), text: str(it.text, 600) };
        })
        .filter((i) => i.title || i.text)
        .slice(0, 24);
      return items.length ? { id, type: "featureGrid", title: str(o.title, 200), items } : null;
    }
    case "cta": {
      const cta = normalizeCta(o);
      const bullets = arr(o.bullets).map((b) => str(b, 300)).filter(Boolean).slice(0, 12);
      return cta ? { id, type: "cta", ...cta, ...(bullets.length ? { bullets } : {}) } : null;
    }
    case "linkCards": {
      const items = arr(o.items)
        .map((i) => {
          const it = obj(i);
          return { imageUrl: safeUrl(it.imageUrl), title: str(it.title, 150), url: safeUrl(it.url) };
        })
        .filter((i) => i.title && i.url)
        .slice(0, 12);
      return items.length ? { id, type: "linkCards", items } : null;
    }
    case "stats":
      return { id, type: "stats" };
    case "video": {
      const url = safeUrl(o.url);
      return url ? { id, type: "video", url } : null;
    }
    case "faq": {
      const items = arr(o.items)
        .map((i) => {
          const it = obj(i);
          return { question: str(it.question, 300), answer: str(it.answer, 3000) };
        })
        .filter((i) => i.question && i.answer)
        .slice(0, 50);
      return items.length ? { id, type: "faq", title: str(o.title, 200), items } : null;
    }
    default:
      return null;
  }
}

/** Fields an admin may set on a post. Server-owned fields (_id, views, timestamps) are excluded. */
export type PostInput = Omit<BlogPost, "_id" | "views" | "createdAt" | "updatedAt" | "wpId">;

export function normalizePostInput(body: unknown): PostInput {
  const o = obj(body);
  const title = str(o.title, 250);
  if (!title) throw new ValidationError("Title is required");
  const slug = slugify(typeof o.slug === "string" && o.slug.trim() ? o.slug : title);
  if (!slug) throw new ValidationError("Slug is invalid");
  if (["category", "tag", "author", "page", "feed", "preview"].includes(slug)) {
    throw new ValidationError(`"${slug}" is a reserved slug`);
  }

  const status = o.status === "published" ? "published" : "draft";
  let publishAt: string | null = null;
  if (typeof o.publishAt === "string" && o.publishAt) {
    const d = new Date(o.publishAt);
    if (Number.isNaN(d.getTime())) throw new ValidationError("Publish date is invalid");
    publishAt = d.toISOString();
  }
  if (status === "published" && !publishAt) publishAt = new Date().toISOString();

  const cover = obj(o.coverImage);
  const coverUrl = safeUrl(cover.url);
  const seo = obj(o.seo);
  const normalizedSeo: PostSeo = {
    title: str(seo.title, 200),
    description: str(seo.description, 400),
    canonical: safeUrl(seo.canonical),
    noindex: seo.noindex === true,
    ogImage: safeUrl(seo.ogImage),
  };

  const id = (v: unknown) => (typeof v === "string" && /^[\w-]{1,64}$/.test(v) ? v : null);

  return {
    title,
    slug,
    excerpt: str(o.excerpt, 1000),
    status,
    publishAt,
    categoryId: id(o.categoryId),
    tagIds: arr(o.tagIds).map(id).filter((v): v is string => !!v).slice(0, 30),
    authorId: id(o.authorId),
    coverImage: coverUrl ? { url: coverUrl, alt: str(cover.alt, 300) } : null,
    heroVideoUrl: safeUrl(o.heroVideoUrl),
    heroCta: normalizeCta(o.heroCta),
    finalCta: normalizeCta(o.finalCta),
    blocks: arr(o.blocks).map(normalizeBlock).filter((b): b is BlogBlock => !!b).slice(0, 300),
    seo: normalizedSeo,
    commentsEnabled: o.commentsEnabled !== false,
    leadForms: normalizePostLeadForms(o.leadForms),
  };
}

/** Validates the admin blog settings form, falling back to defaults for missing parts. */
/** A cleared settings field falls back to the default text, so a form never shows empty. */
function fillLeadDefaults(content: LeadFormContent, defaults: LeadFormContent): LeadFormContent {
  return Object.fromEntries(
    (Object.keys(defaults) as (keyof LeadFormContent)[]).map((k) => [k, content[k] || (k === "highlight" ? "" : defaults[k])]),
  ) as LeadFormContent;
}

export function normalizeSettingsInput(body: unknown): BlogSettings {
  const o = obj(body);
  const stats = obj(o.statsStrip);
  const help = obj(o.helpBox);
  const d = DEFAULT_BLOG_SETTINGS;
  return {
    commentsEnabled: o.commentsEnabled === true,
    indexTitle: str(o.indexTitle, 120) || d.indexTitle,
    indexIntro: arr(o.indexIntro).map((p) => str(p, 1000)).filter(Boolean).slice(0, 5),
    indexImageUrl: safeUrl(o.indexImageUrl),
    statsStrip: {
      enabled: stats.enabled !== false,
      items: arr(stats.items)
        .map((i) => ({ value: str(obj(i).value, 20), label: str(obj(i).label, 60) }))
        .filter((i) => i.value || i.label)
        .slice(0, 12),
    },
    helpBox: {
      enabled: help.enabled !== false,
      heading: str(help.heading, 200),
      text: str(help.text, 1000),
      primaryLabel: str(help.primaryLabel, 60),
      primaryUrl: safeUrl(help.primaryUrl),
      secondaryLabel: str(help.secondaryLabel, 60),
      secondaryUrl: safeUrl(help.secondaryUrl),
    },
    leadForms: {
      enabled: obj(o.leadForms).enabled !== false,
      inline: fillLeadDefaults(normalizeLeadContent(obj(o.leadForms).inline), d.leadForms.inline),
      sidebar: fillLeadDefaults(normalizeLeadContent(obj(o.leadForms).sidebar), d.leadForms.sidebar),
    },
  };
}

export function normalizeTermInput(body: unknown, withAuthorFields: boolean) {
  const o = obj(body);
  const name = str(o.name, 120);
  if (!name) throw new ValidationError("Name is required");
  const slug = slugify(typeof o.slug === "string" && o.slug.trim() ? o.slug : name);
  if (!slug) throw new ValidationError("Slug is invalid");
  const base = { name, slug, description: str(o.description, 1000) };
  return withAuthorFields ? { ...base, bio: str(o.bio, 2000), avatarUrl: safeUrl(o.avatarUrl) } : base;
}
