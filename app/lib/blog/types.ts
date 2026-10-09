// Shared blog types. Stored in the `scholarly_help` database, `blog_*` collections.

export type PostStatus = "draft" | "published";

export type FeatureIcon =
  | "star"
  | "check"
  | "clock"
  | "book"
  | "target"
  | "shield"
  | "lightbulb"
  | "chart";

export type BlogBlock =
  | { id: string; type: "richText"; html: string }
  | { id: string; type: "image"; url: string; alt: string; caption?: string }
  | {
      id: string;
      type: "featureGrid";
      title?: string;
      items: { icon: FeatureIcon; title: string; text: string }[];
    }
  | {
      id: string;
      type: "cta";
      heading: string;
      text?: string;
      bullets?: string[];
      buttonLabel: string;
      buttonUrl: string;
    }
  | { id: string; type: "linkCards"; items: { imageUrl: string; title: string; url: string }[] }
  | { id: string; type: "video"; url: string }
  | { id: string; type: "faq"; title?: string; items: { question: string; answer: string }[] };

export type BlogBlockType = BlogBlock["type"];

export type HeroCta = {
  heading: string;
  text?: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type PostSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  publishAt: string | null; // ISO date; post is live once status is published and publishAt <= now
  categoryId: string | null;
  tagIds: string[];
  authorId: string | null;
  coverImage: { url: string; alt: string } | null;
  heroVideoUrl?: string;
  heroCta?: HeroCta | null;
  finalCta?: HeroCta | null;
  blocks: BlogBlock[];
  seo: PostSeo;
  commentsEnabled: boolean;
  views: number;
  wpId?: number; // set by the WordPress migration, used to re-sync idempotently
  createdAt: string;
  updatedAt: string;
};

export type BlogTerm = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type BlogAuthor = BlogTerm & { avatarUrl?: string; bio?: string };

export type TermKind = "categories" | "tags" | "authors";

export type CommentStatus = "pending" | "approved" | "spam";

export type BlogComment = {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  status: CommentStatus;
  ipHash: string;
  createdAt: string;
};

export type BlogSettings = {
  commentsEnabled: boolean;
  indexTitle: string;
  indexIntro: string[];
  indexImageUrl: string;
};

export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  commentsEnabled: true,
  indexTitle: "Scholarly Help Blogs",
  indexIntro: [
    "Need help with school or college? Our blog is here for you. Find quick tips, clear guides, and honest advice to make your academic journey easier.",
    "Our posts are written by experienced educators and professionals. No confusing jargon—just straightforward ideas you can use right away. From time-saving hacks to real student success stories, we cover what matters most.",
  ],
  indexImageUrl: "",
};
