import Image from "next/image";
import Link from "next/link";
import type { BlogAuthor, BlogPost, BlogTerm, HelpBox, StatsStrip } from "@/app/lib/blog/types";
import type { PostSummary } from "@/app/lib/blog/queries";
import {
  buildToc,
  formatPostDate,
  formatPostTime,
  postUrl,
  readingTimeMinutes,
  siteBaseUrl,
} from "@/app/lib/blog/utils";
import { BlogBlocks, CtaButton, HelpBoxView, YouTubeEmbed } from "./BlogBlocks";
import { BlogCard } from "./BlogCard";
import { CalendarIcon, ChatIcon, ClockIcon, ShareIcons, UserIcon } from "./BlogIcons";
import TableOfContents from "./TableOfContents";
import ViewCounter from "./ViewCounter";
import NewsletterForm from "./NewsletterForm";
import CommentSection from "./CommentSection";

export type PostViewData = {
  post: BlogPost;
  category: BlogTerm | null;
  author: BlogAuthor | null;
  related: PostSummary[];
  recent: PostSummary[];
  categories: BlogTerm[];
  comments: { _id: string; name: string; body: string; createdAt: string }[];
  commentsOpen: boolean;
  stats: StatsStrip;
  helpBox: HelpBox;
  preview?: boolean;
};

function jsonLd(data: PostViewData) {
  const { post, category, author } = data;
  const base = siteBaseUrl();
  const url = post.seo.canonical || `${base}${postUrl(post.slug)}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seo.description || post.excerpt,
      image: post.coverImage?.url ? [post.coverImage.url] : undefined,
      datePublished: post.publishAt,
      dateModified: post.updatedAt,
      author: author ? { "@type": "Person", name: author.name, url: `${base}/blog/author/${author.slug}/` } : undefined,
      publisher: { "@type": "Organization", name: "Scholarly Help", url: base },
      mainEntityOfPage: url,
      articleSection: category?.name,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  const faqItems = post.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  if (faqItems.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqItems.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
    });
  }
  // Escape "<" so post text can never close the script tag.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

export default function PostView(data: PostViewData) {
  const { post, category, author, related, recent, categories, comments, commentsOpen, stats, helpBox, preview } = data;
  const { blocks, toc, anchors } = buildToc(post.blocks);
  const shareUrl = encodeURIComponent(`${siteBaseUrl()}${postUrl(post.slug)}`);
  const shareTitle = encodeURIComponent(post.title);
  const byId = new Map(categories.map((c) => [c._id, c]));

  return (
    <article>
      {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />}
      {preview && (
        <div style={{ background: "#fef3c7", color: "#92400e", textAlign: "center", padding: "10px 16px", fontWeight: 600 }}>
          Preview — this is how the post will look. {post.status === "draft" ? "It is a draft and not public." : ""}
        </div>
      )}

      <header className="blog-post-hero">
        <div className="blog-wide">
          <p className="blog-breadcrumb">
            <Link href="/">Home</Link> » <Link href="/blog/">Blog</Link> » {post.title}
          </p>
          {category && (
            <Link href={`/blog/category/${category.slug}/`} className="blog-cat-pill">{category.name}</Link>
          )}
          <div className="blog-post-hero-grid">
            <div>
              <h1 className="blog-post-title">{post.title}</h1>
              {post.excerpt && <p className="blog-post-intro">{post.excerpt}</p>}
              <div className="blog-meta">
                {author && (
                  <div className="blog-meta-item">
                    <span className="blog-meta-icon"><UserIcon /></span>
                    <span><span className="blog-meta-label">Written By</span><span className="blog-meta-value">{author.name}</span></span>
                  </div>
                )}
                <div className="blog-meta-item">
                  <span className="blog-meta-icon"><CalendarIcon /></span>
                  <span><span className="blog-meta-label">Published</span><span className="blog-meta-value">{formatPostDate(post.publishAt) || "Not published"}</span></span>
                </div>
                {post.publishAt && (
                  <div className="blog-meta-item">
                    <span className="blog-meta-icon"><ClockIcon /></span>
                    <span><span className="blog-meta-label">Time</span><span className="blog-meta-value">{formatPostTime(post.publishAt)}</span></span>
                  </div>
                )}
                <div className="blog-meta-item">
                  <span className="blog-meta-icon"><ChatIcon /></span>
                  <span><span className="blog-meta-label">Read Time</span><span className="blog-meta-value">{readingTimeMinutes(post.blocks)} min</span></span>
                </div>
              </div>
            </div>
            {(post.heroVideoUrl || post.coverImage) && (
              <div className="blog-hero-media">
                {post.heroVideoUrl ? (
                  <YouTubeEmbed url={post.heroVideoUrl} title={post.title} />
                ) : post.coverImage ? (
                  <Image src={post.coverImage.url} alt={post.coverImage.alt || post.title} fill priority sizes="(max-width: 900px) 100vw, 600px" style={{ objectFit: "cover" }} />
                ) : null}
              </div>
            )}
          </div>
          {post.heroCta && (
            <div className="blog-hero-cta">
              <div>
                <h2>{post.heroCta.heading}</h2>
                {post.heroCta.text && <p>{post.heroCta.text}</p>}
              </div>
              <CtaButton label={post.heroCta.buttonLabel} url={post.heroCta.buttonUrl} />
            </div>
          )}
        </div>
      </header>

      <div className="blog-wide">
        <div className="blog-post-layout">
          <div className="blog-card-panel">
            <div className="blog-content">
              {/* Like the WordPress template: intro first, then the featured image (when the header shows a video). */}
              <BlogBlocks blocks={blocks.slice(0, 1)} anchors={anchors} stats={stats} />
              {post.heroVideoUrl && post.coverImage && (
                <div className="blog-figure-img">
                  <Image src={post.coverImage.url} alt={post.coverImage.alt || post.title} width={1200} height={675} sizes="(max-width: 1100px) 100vw, 760px" style={{ width: "100%", height: "auto" }} />
                </div>
              )}
              <BlogBlocks blocks={blocks.slice(1)} anchors={anchors} stats={stats} />
              <HelpBoxView help={helpBox} />
            </div>
            {!preview && <CommentSection postId={post._id} comments={comments} open={commentsOpen} />}
          </div>

          <aside className="blog-sidebar">
            <TableOfContents items={toc} />
            {preview ? null : <ViewCounter postId={post._id} initialViews={post.views} />}
            <div className="blog-card-panel blog-side-center">
              <h2 className="blog-side-title">Share This Article</h2>
              <div className="blog-share">
                <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">{ShareIcons.whatsapp}</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">{ShareIcons.facebook}</a>
                <a href={`https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest">{ShareIcons.pinterest}</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">{ShareIcons.linkedin}</a>
              </div>
            </div>
            {related.length > 0 && (
              <div className="blog-card-panel">
                <h2 className="blog-side-title blog-side-center">Related Articles</h2>
                <div className="blog-related">
                  {related.map((r) => (
                    <Link key={r._id} href={postUrl(r.slug)}>
                      <span className="blog-related-thumb">
                        {r.coverImage && <Image src={r.coverImage.url} alt="" fill sizes="80px" style={{ objectFit: "cover" }} />}
                      </span>
                      <span className="blog-related-title">{r.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <NewsletterForm />
          </aside>
        </div>

        {author && (
          <section className="blog-author" aria-label="About the author">
            <div className="blog-author-avatar">
              {author.avatarUrl ? (
                <Image src={author.avatarUrl} alt={author.name} fill sizes="120px" style={{ objectFit: "cover" }} />
              ) : (
                <svg viewBox="0 0 24 24" fill="#fff" aria-hidden style={{ width: "100%", height: "100%" }}><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V24h18v-4.5C21 16.5 17 14 12 14z" /></svg>
              )}
            </div>
            <div>
              <h2>{author.name}</h2>
              {author.bio && <p>{author.bio}</p>}
              <Link href={`/blog/author/${author.slug}/`} className="blog-outline-btn">View More From {author.name}</Link>
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="blog-container" aria-labelledby="recent-posts">
            <h2 id="recent-posts" className="blog-section-title">Recent Posts</h2>
            <div className="blog-grid">
              {recent.map((r) => (
                <BlogCard key={r._id} post={r} category={r.categoryId ? byId.get(r.categoryId) : undefined} />
              ))}
            </div>
          </section>
        )}

        {post.finalCta && (
          <section className="blog-final-cta">
            <h2>{post.finalCta.heading}</h2>
            {post.finalCta.text && <p>{post.finalCta.text}</p>}
            <CtaButton label={post.finalCta.buttonLabel} url={post.finalCta.buttonUrl} />
          </section>
        )}
      </div>
    </article>
  );
}
