// Canonical blog post sitemap. This keeps the public URL used by the former
// WordPress/Yoast blog so search engines do not need to discover a new sitemap.
// It lists the blog index and live, indexable posts; noindex archives are omitted.
import { getBlogCollections } from "@/app/lib/blog/db";
import { liveFilter, postUrl, siteBaseUrl } from "@/app/lib/blog/utils";

// Rendered per request and explicitly excluded from the site's shared HTML cache
// so newly published posts appear immediately.
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
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/xml; charset=utf-8",
        "X-Robots-Tag": "noindex, follow",
      },
    },
  );
}
