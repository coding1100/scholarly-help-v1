/*
 * WordPress -> Next.js blog migration. Re-runnable: posts are matched by their
 * WordPress id, terms by slug, and uploaded images are cached, so running it
 * again updates content instead of duplicating it.
 *
 *   npx vite-node -c vitest.config.ts scripts/blog-migrate/migrate.ts -- [options]
 *
 * Options:
 *   --dry-run        convert and report only; no uploads, no database writes
 *   --no-images      keep WordPress image URLs instead of uploading to Cloudinary
 *   --only=a,b       migrate only these post slugs
 *   --settings       also (re)import the blog index header from WordPress
 *   --report=FILE    write a Markdown report (default: blog-migration-report.md)
 *
 * Reads DATABASE_URL, CLOUDINARY_* and BLOG_CLOUDINARY_FOLDER from .env.
 */
import "./env";
import { randomUUID, createHash } from "crypto";
import { writeFileSync } from "fs";
import { load } from "cheerio";
import { getBlogCollections, type BlogCollections } from "@/app/lib/blog/db";
import { getMongoDb } from "@/app/lib/mongodb";
import { normalizePostInput, ValidationError } from "@/app/lib/blog/validate";
import { blockText, decodeEntities, slugify } from "@/app/lib/blog/utils";
import { toPlainText } from "@/app/lib/blog/sanitize";
import { uploadBlogImage, blogImageFolder } from "@/app/lib/blog/cloudinary";
import type { BlogPost } from "@/app/lib/blog/types";
import { columnText, convertPostPage, type RawBlock } from "./convert";

const WP = (process.env.WP_BLOG_URL || "https://scholarlyhelp.com/blog").replace(/\/+$/, "");
const args = new Map(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.slice(2).split("=");
    return [k, v ?? "true"] as const;
  }),
);
const DRY = args.has("dry-run");
const UPLOAD = !DRY && !args.has("no-images");
const ONLY = args.get("only")?.split(",").filter(Boolean);
const REPORT = args.get("report") || "blog-migration-report.md";

type WpTerm = { id: number; name: string; slug: string; description: string };
type WpPost = {
  id: number;
  slug: string;
  link: string;
  date_gmt: string;
  modified_gmt: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  tags: number[];
  featured_media: number;
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: { index?: string };
    og_image?: { url: string }[];
  };
};

async function getJson<T>(url: string, attempt = 1): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "ScholarlyHelp-blog-migration/1.0" } });
  if (!res.ok) {
    if (attempt < 3) return getJson(url, attempt + 1);
    throw new Error(`${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
}

async function getText(url: string, attempt = 1): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "ScholarlyHelp-blog-migration/1.0" } });
  if (!res.ok) {
    if (attempt < 3) return getText(url, attempt + 1);
    throw new Error(`${res.status} ${url}`);
  }
  return res.text();
}

async function getAll<T>(endpoint: string, fields: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const batch = await getJson<T[]>(`${WP}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_fields=${fields}`);
    out.push(...batch);
    if (batch.length < 100) return out;
  }
}

const plain = (html: string) => decodeEntities(toPlainText(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim());
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

// ---------- Images ----------
const isWpUpload = (url: string) => /\/wp-content\/uploads\//.test(url);

class ImageMigrator {
  private memo = new Map<string, Promise<string>>();
  uploaded = 0;
  reused = 0;
  failed: string[] = [];
  constructor(private c: BlogCollections | null) {}

  /** Returns the Cloudinary URL for a WordPress upload (or the input when not uploading). */
  map(url: string): Promise<string> {
    if (!UPLOAD || !url || !isWpUpload(url)) return Promise.resolve(url);
    const clean = url.split("?")[0];
    if (!this.memo.has(clean)) this.memo.set(clean, this.upload(clean));
    return this.memo.get(clean)!;
  }

  private async upload(url: string): Promise<string> {
    const db = await getMongoDb();
    const cache = db!.collection<{ _id: string; url: string }>("blog_migration_images");
    const key = `${blogImageFolder()}|${url}`;
    const hit = await cache.findOne({ _id: key });
    if (hit) {
      this.reused++;
      return hit.url;
    }
    const name = url.split("/").pop()!.replace(/\.[a-z0-9]+$/i, "");
    const publicId = `${slugify(name).slice(0, 60) || "image"}-${createHash("sha1").update(url).digest("hex").slice(0, 8)}`;
    try {
      const { url: cdn } = await uploadBlogImage(url, { publicId });
      await cache.updateOne({ _id: key }, { $set: { url: cdn } }, { upsert: true });
      this.uploaded++;
      return cdn;
    } catch (error) {
      this.failed.push(`${url} (${error instanceof Error ? error.message : String(error)})`);
      return url;
    }
  }

  async mapBlocks(blocks: RawBlock[]): Promise<RawBlock[]> {
    return Promise.all(
      blocks.map(async (b) => {
        if (b.type === "richText") {
          let html = String(b.html);
          for (const src of new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]))) {
            html = html.split(src).join(await this.map(src));
          }
          return { ...b, html };
        }
        if (b.type === "image") return { ...b, url: await this.map(String(b.url)) };
        if (b.type === "linkCards") {
          const items = b.items as { imageUrl: string }[];
          return { ...b, items: await Promise.all(items.map(async (i) => ({ ...i, imageUrl: await this.map(i.imageUrl) }))) };
        }
        return b;
      }),
    );
  }
}

// ---------- Terms ----------
async function upsertTerms(c: BlogCollections | null, kind: "categories" | "tags", terms: WpTerm[]) {
  const idByWp = new Map<number, string>();
  for (const t of terms) {
    const doc = { name: decodeEntities(t.name), slug: t.slug, description: plain(t.description || "") };
    if (!c) {
      idByWp.set(t.id, `dry-${t.slug}`);
      continue;
    }
    const existing = await c[kind].findOne({ slug: t.slug });
    const _id = existing?._id ?? randomUUID();
    await c[kind].updateOne({ _id }, { $set: { ...doc, wpId: t.id } as never }, { upsert: true });
    idByWp.set(t.id, _id);
  }
  return idByWp;
}

async function upsertAuthor(c: BlogCollections | null, name: string, wpSlug: string | null, cache: Map<string, string>) {
  const slug = slugify(name);
  if (cache.has(slug)) return cache.get(slug)!;
  let id = `dry-${slug}`;
  if (c) {
    const existing = await c.authors.findOne({ slug });
    id = existing?._id ?? randomUUID();
    if (!existing) await c.authors.insertOne({ _id: id, name, slug, description: "", bio: "", avatarUrl: "" });
    if (wpSlug && wpSlug !== slug) {
      await c.redirects.updateOne(
        { _id: `author/${wpSlug}` },
        { $set: { from: `author/${wpSlug}`, to: slug, createdAt: new Date().toISOString() } },
        { upsert: true },
      );
    }
  }
  cache.set(slug, id);
  return id;
}

// ---------- Index header ----------
async function migrateIndexSettings(c: BlogCollections, images: ImageMigrator) {
  const $ = load(await getText(`${WP}/`));
  const h1 = $("h1").filter((_, el) => /blog/i.test($(el).text())).first();
  const section = h1.closest("[data-element_type=container]").parent().closest("[data-element_type=container]");
  const scope = section.length ? section : h1.parent();
  const intro = scope.find(".elementor-widget-text-editor p").toArray().map((p) => plain($(p).text())).filter(Boolean);
  const img = scope.find(".elementor-widget-image img").first().attr("src") || "";
  const settings = {
    indexTitle: plain(h1.text()) || "Scholarly Help Blogs",
    indexIntro: intro.slice(0, 5),
    indexImageUrl: await images.map(img),
  };
  await c.settings.updateOne({ _id: "settings" }, { $set: settings, $setOnInsert: { commentsEnabled: true } }, { upsert: true });
  return settings;
}

// ---------- Main ----------
type ReportRow = { slug: string; status: string; wpWords: number; newWords: number; blocks: number; images: string; notes: string };

async function main() {
  console.log(`WordPress: ${WP}  | mode: ${DRY ? "DRY RUN" : "WRITE"} | images: ${UPLOAD ? `upload to ${blogImageFolder()}` : "keep WordPress URLs"}`);
  const c = DRY ? null : await getBlogCollections();
  if (!DRY && !c) throw new Error("Database unavailable (check DATABASE_URL)");

  const [categories, tags, allPosts] = await Promise.all([
    getAll<WpTerm>("categories", "id,name,slug,description"),
    getAll<WpTerm>("tags", "id,name,slug,description"),
    getAll<WpPost>("posts", "id,slug,link,date_gmt,modified_gmt,title,excerpt,categories,tags,featured_media,yoast_head_json"),
  ]);
  const posts = ONLY ? allPosts.filter((p) => ONLY.includes(p.slug)) : allPosts;
  console.log(`Found ${allPosts.length} posts (${posts.length} selected), ${categories.length} categories, ${tags.length} tags`);

  const catIds = await upsertTerms(c, "categories", categories.filter((t) => t.slug !== "uncategorized" || allPosts.some((p) => p.categories.includes(t.id))));
  const tagIds = await upsertTerms(c, "tags", tags);

  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))];
  const media = new Map<number, { source_url: string; alt_text: string }>();
  for (let i = 0; i < mediaIds.length; i += 100) {
    const batch = await getJson<{ id: number; source_url: string; alt_text: string }[]>(
      `${WP}/wp-json/wp/v2/media?per_page=100&include=${mediaIds.slice(i, i + 100).join(",")}&_fields=id,source_url,alt_text`,
    );
    batch.forEach((m) => media.set(m.id, m));
  }

  const images = new ImageMigrator(c);
  const authors = new Map<string, string>();
  const report: ReportRow[] = [];
  const allWarnings = new Map<string, number>();

  const queue = [...posts];
  async function worker() {
    for (let wp = queue.shift(); wp; wp = queue.shift()) {
      const row: ReportRow = { slug: wp.slug, status: "", wpWords: 0, newWords: 0, blocks: 0, images: "", notes: "" };
      try {
        const html = await getText(wp.link);
        const page = convertPostPage(html);
        page.warnings.forEach((w) => allWarnings.set(w.replace(/\(.*\)/, "(…)"), (allWarnings.get(w.replace(/\(.*\)/, "(…)")) ?? 0) + 1));

        const featured = media.get(wp.featured_media);
        const blocks = await images.mapBlocks(page.blocks);
        const coverUrl = featured ? await images.map(featured.source_url) : "";
        const authorId = page.author ? await upsertAuthor(c, page.author.name, page.author.wpSlug, authors) : null;
        const yoast = wp.yoast_head_json ?? {};
        const ogImage = yoast.og_image?.[0]?.url;

        const input = normalizePostInput({
          title: decodeEntities(wp.title.rendered),
          slug: wp.slug,
          excerpt: plain(wp.excerpt.rendered).replace(/\s*\[(…|&hellip;|\.\.\.)\]\s*$/, ""),
          status: "published",
          publishAt: `${wp.date_gmt}Z`,
          categoryId: wp.categories.map((id) => catIds.get(id)).find(Boolean) ?? null,
          tagIds: wp.tags.map((id) => tagIds.get(id)).filter(Boolean),
          authorId,
          coverImage: coverUrl ? { url: coverUrl, alt: featured?.alt_text || decodeEntities(wp.title.rendered) } : null,
          heroVideoUrl: page.heroVideoUrl,
          heroCta: page.heroCta,
          finalCta: page.finalCta,
          blocks,
          seo: {
            title: yoast.title ? decodeEntities(yoast.title) : "",
            description: yoast.description ? decodeEntities(yoast.description) : "",
            canonical: yoast.canonical && yoast.canonical.replace(/\/+$/, "") !== wp.link.replace(/\/+$/, "") ? yoast.canonical : "",
            noindex: yoast.robots?.index === "noindex",
            ogImage: ogImage && featured && ogImage !== featured.source_url ? await images.map(ogImage) : "",
          },
          commentsEnabled: true,
        });

        row.wpWords = words(columnText(html));
        row.newWords = words(input.blocks.map(blockText).join(" "));
        row.blocks = input.blocks.length;
        const imgCount = (s: string) => (s.match(/<img\b/g) || []).length;
        const leftOnWp = JSON.stringify(input).match(/wp-content\/uploads/g)?.length ?? 0;
        row.images = `${input.blocks.reduce((n, b) => n + (b.type === "richText" ? imgCount(b.html) : b.type === "image" ? 1 : b.type === "linkCards" ? b.items.length : 0), 0)} in body${UPLOAD && leftOnWp ? `, ${leftOnWp} still on WP` : ""}`;
        row.notes = page.warnings.join("; ");

        if (c) {
          const existing = await c.posts.findOne({ wpId: wp.id }, { projection: { _id: 1, views: 1 } });
          const now = `${wp.modified_gmt}Z`;
          if (existing) {
            await c.posts.updateOne(
              { _id: existing._id },
              { $set: { ...input, updatedAt: now, views: Math.max(existing.views ?? 0, page.views) } },
            );
            row.status = "updated";
          } else {
            const doc: BlogPost = { _id: randomUUID(), ...input, views: page.views, wpId: wp.id, createdAt: `${wp.date_gmt}Z`, updatedAt: now };
            await c.posts.insertOne(doc);
            row.status = "created";
          }
        } else row.status = "dry-run ok";
      } catch (error) {
        row.status = "FAILED";
        row.notes = error instanceof ValidationError ? `validation: ${error.message}` : error instanceof Error ? error.message : String(error);
      }
      report.push(row);
      console.log(`${row.status.padEnd(10)} ${wp.slug}  (${row.blocks} blocks, ${row.newWords}/${row.wpWords} words)`);
    }
  }
  await Promise.all([worker(), worker(), worker()]);

  let settingsNote = "skipped (use --settings)";
  if (c && (args.has("settings") || !(await c.settings.findOne({ _id: "settings" })))) {
    const s = await migrateIndexSettings(c, images);
    settingsNote = `imported ("${s.indexTitle}", ${s.indexIntro.length} paragraphs, image ${s.indexImageUrl ? "yes" : "no"})`;
  }

  report.sort((a, b) => a.slug.localeCompare(b.slug));
  const failed = report.filter((r) => r.status === "FAILED");
  const lowCoverage = report.filter((r) => r.wpWords && r.newWords / r.wpWords < 0.85);
  const md = [
    `# Blog migration report`,
    ``,
    `- Run: ${new Date().toISOString()} (${DRY ? "dry run" : "write"})`,
    `- Source: ${WP}`,
    `- Posts: ${report.length} processed, ${report.filter((r) => r.status === "created").length} created, ${report.filter((r) => r.status === "updated").length} updated, ${failed.length} failed`,
    `- Images: ${images.uploaded} uploaded, ${images.reused} reused from earlier runs, ${images.failed.length} failed${UPLOAD ? ` (folder ${blogImageFolder()})` : " (not uploaded)"}`,
    `- Index header: ${settingsNote}`,
    `- Word coverage below 85%: ${lowCoverage.length ? lowCoverage.map((r) => r.slug).join(", ") : "none"}`,
    ``,
    `## Content intentionally not migrated`,
    ...[...allWarnings].map(([w, n]) => `- ${w} — ${n} post(s)`),
    ...(images.failed.length ? [``, `## Image upload failures`, ...images.failed.map((f) => `- ${f}`)] : []),
    ``,
    `## Posts`,
    ``,
    `| Post | Status | Words (new / WP column) | Blocks | Images | Notes |`,
    `|---|---|---|---|---|---|`,
    ...report.map((r) => `| ${r.slug} | ${r.status} | ${r.newWords} / ${r.wpWords} (${r.wpWords ? Math.round((r.newWords / r.wpWords) * 100) : 0}%) | ${r.blocks} | ${r.images} | ${r.notes.replace(/\|/g, "/")} |`),
    ``,
  ].join("\n");
  writeFileSync(REPORT, md);
  console.log(`\nReport written to ${REPORT}`);
  console.log(`${report.length - failed.length}/${report.length} posts OK, ${images.uploaded} images uploaded, ${images.failed.length} image failures`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
