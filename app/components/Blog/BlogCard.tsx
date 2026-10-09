import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/app/lib/blog/queries";
import type { BlogTerm } from "@/app/lib/blog/types";
import { postUrl } from "@/app/lib/blog/utils";

export function BlogCard({ post, category, priority }: { post: PostSummary; category?: BlogTerm; priority?: boolean }) {
  const href = postUrl(post.slug);
  return (
    <article className="blog-card">
      <Link href={href} className="blog-card-thumb" aria-label={post.title} tabIndex={-1}>
        {category && <span className="blog-card-badge">{category.name}</span>}
        {post.coverImage && (
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 360px"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
        )}
      </Link>
      <div className="blog-card-body">
        <h2 className="blog-card-title">
          <Link href={href}>{post.title}</Link>
        </h2>
        <Link href={href} className="blog-card-more">
          Read More »
        </Link>
      </div>
    </article>
  );
}

export function BlogGrid({ posts, categories }: { posts: PostSummary[]; categories: BlogTerm[] }) {
  if (!posts.length) return <p className="blog-empty">No posts yet.</p>;
  const byId = new Map(categories.map((c) => [c._id, c]));
  return (
    <div className="blog-grid">
      {posts.map((post, i) => (
        <BlogCard key={post._id} post={post} category={post.categoryId ? byId.get(post.categoryId) : undefined} priority={i < 3} />
      ))}
    </div>
  );
}
