import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogGrid } from "./BlogCard";
import { findRedirect, getTermBySlug, getTerms, listLivePosts } from "@/app/lib/blog/queries";
import { siteBaseUrl } from "@/app/lib/blog/utils";
import type { TermKind } from "@/app/lib/blog/types";

const LABEL: Record<TermKind, { prefix: string; path: string }> = {
  categories: { prefix: "Category", path: "category" },
  tags: { prefix: "Tag", path: "tag" },
  authors: { prefix: "Author", path: "author" },
};

export async function archiveMetadata(kind: TermKind, slug: string): Promise<Metadata> {
  const term = await getTermBySlug(kind, slug);
  if (!term) return { title: "Not found - Scholarly Help", robots: { index: false } };
  return {
    title: `${term.name} - Scholarly Help Blog`,
    description: term.description || `${LABEL[kind].prefix}: ${term.name} articles from the Scholarly Help blog.`,
    alternates: { canonical: `${siteBaseUrl()}/blog/${LABEL[kind].path}/${term.slug}/` },
    // Like the WordPress/Yoast setup: archives are for visitors, not search results.
    robots: { index: false, follow: true },
  };
}

/** Category, tag and author archives share the blog index card grid. */
export default async function ArchivePage({ kind, slug }: { kind: TermKind; slug: string }) {
  const term = await getTermBySlug(kind, slug);
  if (!term) {
    // Old WordPress archive URLs (e.g. /blog/author/{wp-username}/) are stored as "author/{slug}".
    const target = await findRedirect(`${LABEL[kind].path}/${slug}`);
    if (target) permanentRedirect(`/blog/${LABEL[kind].path}/${target}/`);
    notFound();
  }
  const filter =
    kind === "categories" ? { categoryId: term._id } : kind === "tags" ? { tagId: term._id } : { authorId: term._id };
  const [posts, categories] = await Promise.all([listLivePosts(filter), getTerms("categories")]);
  return (
    <main>
      <section className="blog-index-hero">
        <div className="blog-container" style={{ display: "block" }}>
          <p className="blog-breadcrumb" style={{ color: "var(--blog-muted)" }}>{LABEL[kind].prefix}</p>
          <h1 className="blog-archive-title">{term.name}</h1>
          {term.description && <p>{term.description}</p>}
          {"bio" in term && typeof term.bio === "string" && term.bio && <p>{term.bio}</p>}
        </div>
      </section>
      <div className="blog-container">
        <BlogGrid posts={posts} categories={categories} />
      </div>
    </main>
  );
}
