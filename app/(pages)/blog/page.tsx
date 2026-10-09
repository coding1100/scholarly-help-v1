import type { Metadata } from "next";
import Image from "next/image";
import { BlogGrid } from "@/app/components/Blog/BlogCard";
import { getBlogSettings, getTerms, listLivePosts } from "@/app/lib/blog/queries";
import { siteBaseUrl } from "@/app/lib/blog/utils";

// Admin saves call revalidatePath() for instant updates; the TTL also picks up scheduled posts.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings();
  const url = `${siteBaseUrl()}/blog/`;
  return {
    title: "Blog - Scholarly Help",
    description: settings.indexIntro[0],
    alternates: { canonical: url, types: { "application/rss+xml": `${siteBaseUrl()}/blog/feed/` } },
    openGraph: { type: "website", url, title: settings.indexTitle, description: settings.indexIntro[0], siteName: "Scholarly Help" },
  };
}

export default async function BlogIndexPage() {
  const [settings, posts, categories] = await Promise.all([getBlogSettings(), listLivePosts(), getTerms("categories")]);
  return (
    <main>
      <section className="blog-index-hero">
        <div className="blog-container">
          <div>
            <h1>{settings.indexTitle}</h1>
            {settings.indexIntro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {settings.indexImageUrl && (
            <div className="blog-index-hero-img">
              <Image src={settings.indexImageUrl} alt="" fill priority sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: "cover" }} />
            </div>
          )}
        </div>
      </section>
      <div className="blog-container">
        <BlogGrid posts={posts} categories={categories} />
      </div>
    </main>
  );
}
