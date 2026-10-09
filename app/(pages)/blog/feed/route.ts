import { getBlogCollections } from "@/app/lib/blog/db";
import { liveFilter, postUrl, siteBaseUrl } from "@/app/lib/blog/utils";

// RSS 2.0 feed at /blog/feed/ (same URL WordPress used).
export const revalidate = 300;

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const base = siteBaseUrl();
  const c = await getBlogCollections();
  const posts = c
    ? await c.posts
        .find(liveFilter(), { projection: { title: 1, slug: 1, excerpt: 1, publishAt: 1 } })
        .sort({ publishAt: -1 })
        .limit(30)
        .toArray()
    : [];
  const items = posts
    .map((p) => {
      const link = `${base}${postUrl(p.slug)}`;
      return `<item><title>${xml(p.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${new Date(p.publishAt!).toUTCString()}</pubDate><description>${xml(p.excerpt)}</description></item>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Scholarly Help Blog</title>
<link>${base}/blog/</link>
<atom:link href="${base}/blog/feed/" rel="self" type="application/rss+xml" />
<description>Study tips, guides and academic advice from Scholarly Help.</description>
<language>en-US</language>
${items}
</channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
