import { getBlogCollections } from "./db";
import { liveFilter } from "./utils";
import {
  DEFAULT_BLOG_SETTINGS,
  type BlogAuthor,
  type BlogComment,
  type BlogPost,
  type BlogSettings,
  type BlogTerm,
  type TermKind,
} from "./types";

export type PostSummary = Pick<
  BlogPost,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "categoryId" | "authorId" | "publishAt"
>;

const SUMMARY_PROJECTION = {
  title: 1, slug: 1, excerpt: 1, coverImage: 1, categoryId: 1, authorId: 1, publishAt: 1,
} as const;

export async function getBlogSettings(): Promise<BlogSettings> {
  const c = await getBlogCollections();
  const doc = c ? await c.settings.findOne({ _id: "settings" }) : null;
  if (!doc) return DEFAULT_BLOG_SETTINGS;
  const { _id, ...settings } = doc;
  return { ...DEFAULT_BLOG_SETTINGS, ...settings };
}

export async function listLivePosts(
  filter: { categoryId?: string; tagId?: string; authorId?: string } = {},
  limit = 500,
): Promise<PostSummary[]> {
  const c = await getBlogCollections();
  if (!c) return [];
  const query: Record<string, unknown> = { ...liveFilter() };
  if (filter.categoryId) query.categoryId = filter.categoryId;
  if (filter.tagId) query.tagIds = filter.tagId;
  if (filter.authorId) query.authorId = filter.authorId;
  return c.posts
    .find(query, { projection: SUMMARY_PROJECTION })
    .sort({ publishAt: -1 })
    .limit(limit)
    .toArray() as Promise<PostSummary[]>;
}

export async function getLivePostBySlug(slug: string): Promise<BlogPost | null> {
  const c = await getBlogCollections();
  if (!c) return null;
  return c.posts.findOne({ slug, ...liveFilter() });
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const c = await getBlogCollections();
  return c ? c.posts.findOne({ _id: id }) : null;
}

export async function getTerms<K extends TermKind>(
  kind: K,
): Promise<(K extends "authors" ? BlogAuthor : BlogTerm)[]> {
  const c = await getBlogCollections();
  if (!c) return [];
  return (await c[kind].find({}).sort({ name: 1 }).toArray()) as never;
}

export async function getTermBySlug(kind: TermKind, slug: string) {
  const c = await getBlogCollections();
  return c ? c[kind].findOne({ slug }) : null;
}

export async function getTermById(kind: TermKind, id: string | null) {
  if (!id) return null;
  const c = await getBlogCollections();
  return c ? c[kind].findOne({ _id: id }) : null;
}

/**
 * Follows stored redirects. Keys are an old post slug ("old-slug") or an archive
 * path ("author/old-slug"); the value is the current slug.
 */
export async function findRedirect(key: string): Promise<string | null> {
  const c = await getBlogCollections();
  const doc = c ? await c.redirects.findOne({ _id: key }) : null;
  return doc?.to ?? null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<PostSummary[]> {
  const c = await getBlogCollections();
  if (!c) return [];
  const related = post.categoryId
    ? ((await c.posts
        .find({ ...liveFilter(), categoryId: post.categoryId, _id: { $ne: post._id } }, { projection: SUMMARY_PROJECTION })
        .sort({ publishAt: -1 })
        .limit(limit)
        .toArray()) as PostSummary[])
    : [];
  return related;
}

export async function getRecentPosts(excludeId: string, limit = 3): Promise<PostSummary[]> {
  const c = await getBlogCollections();
  if (!c) return [];
  return (await c.posts
    .find({ ...liveFilter(), _id: { $ne: excludeId } }, { projection: SUMMARY_PROJECTION })
    .sort({ publishAt: -1 })
    .limit(limit)
    .toArray()) as PostSummary[];
}

export async function getApprovedComments(postId: string): Promise<Pick<BlogComment, "_id" | "name" | "body" | "createdAt">[]> {
  const c = await getBlogCollections();
  if (!c) return [];
  return c.comments
    .find({ postId, status: "approved" }, { projection: { name: 1, body: 1, createdAt: 1 } })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();
}
