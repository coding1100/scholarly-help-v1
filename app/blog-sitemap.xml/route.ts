// Sitemap for the blog, served at /blog-sitemap.xml. Lists the blog index and live,
// indexable posts. Archives are noindex (as on WordPress), so they are left out.
import { getBlogCollections } from "@/app/lib/blog/db";
import { liveFilter, postUrl, siteBaseUrl } from "@/app/lib/blog/utils";

// Rendered per request so new posts appear immediately (a cheap query; the CDN
// still caches it briefly via the site's s-maxage header).
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteBaseUrl();
  const c = await getBlogCollections();
  const entries: { loc: string; lastmod?: string }[] = [{ loc: `${base}/blog/` }];

  if (c) {
    const posts = await c.posts
      .find({ ...liveFilter(), "seo.noindex": { $ne: true } }, { projection: { slug: 1, updatedAt: 1 } })
      .sort({ publishAt: -1 })
      .toArray();
    for (const p of posts) entries.push({ loc: `${base}${postUrl(p.slug)}`, lastmod: p.updatedAt });
  }

  const urls = entries
    .map((e) => `<url>\n<loc>${e.loc}</loc>${e.lastmod ? `\n<lastmod>${e.lastmod}</lastmod>` : ""}\n</url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
