import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import PostView from "@/app/components/Blog/PostView";
import { findRedirect, getLivePostBySlug } from "@/app/lib/blog/queries";
import { loadPostView } from "@/app/lib/blog/postView";
import { postUrl, siteBaseUrl } from "@/app/lib/blog/utils";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getLivePostBySlug(slug);
  if (!post) return { title: "Post not found - Scholarly Help", robots: { index: false } };
  const url = post.seo.canonical || `${siteBaseUrl()}${postUrl(post.slug)}`;
  const title = post.seo.title || `${post.title} - Scholarly Help`;
  const description = post.seo.description || post.excerpt;
  const image = post.seo.ogImage || post.coverImage?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: post.seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Scholarly Help",
      publishedTime: post.publishAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getLivePostBySlug(slug);
  if (!post) {
    const target = await findRedirect(slug);
    if (target) permanentRedirect(postUrl(target));
    notFound();
  }
  return <PostView {...await loadPostView(post)} />;
}
