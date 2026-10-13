import type { Collection, Db } from "mongodb";
import { getMongoDb } from "@/app/lib/mongodb";
import type {
  BlogAuthor,
  BlogComment,
  BlogPost,
  BlogSettings,
  BlogTerm,
  TermKind,
} from "./types";

type SettingsDoc = BlogSettings & { _id: string };
type RedirectDoc = { _id: string; from: string; to: string; createdAt: string };
type SubscriberDoc = { _id: string; email: string; ipHash: string; createdAt: string };

export type BlogCollections = {
  posts: Collection<BlogPost>;
  categories: Collection<BlogTerm>;
  tags: Collection<BlogTerm>;
  authors: Collection<BlogAuthor>;
  comments: Collection<BlogComment>;
  settings: Collection<SettingsDoc>;
  redirects: Collection<RedirectDoc>;
  subscribers: Collection<SubscriberDoc>;
};

const globalForBlog = global as typeof globalThis & { _blogIndexes?: Promise<void> };

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("blog_posts").createIndex({ slug: 1 }, { unique: true }),
    db.collection("blog_posts").createIndex({ status: 1, publishAt: -1 }),
    db.collection("blog_posts").createIndex({ categoryId: 1 }),
    db.collection("blog_posts").createIndex({ wpId: 1 }, { sparse: true }),
    db.collection("blog_categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("blog_tags").createIndex({ slug: 1 }, { unique: true }),
    db.collection("blog_authors").createIndex({ slug: 1 }, { unique: true }),
    db.collection("blog_comments").createIndex({ postId: 1, status: 1, createdAt: -1 }),
    db.collection("blog_comments").createIndex({ ipHash: 1, createdAt: -1 }),
    db.collection("blog_subscribers").createIndex({ email: 1 }, { unique: true }),
  ]);
}

/** Returns typed blog collections, or null when the database is unavailable. */
export async function getBlogCollections(): Promise<BlogCollections | null> {
  const db = await getMongoDb();
  if (!db) return null;
  if (!globalForBlog._blogIndexes) {
    globalForBlog._blogIndexes = ensureIndexes(db).catch((error) => {
      globalForBlog._blogIndexes = undefined;
      console.error("Failed to create blog indexes:", error);
    });
  }
  await globalForBlog._blogIndexes;
  return {
    posts: db.collection<BlogPost>("blog_posts"),
    categories: db.collection<BlogTerm>("blog_categories"),
    tags: db.collection<BlogTerm>("blog_tags"),
    authors: db.collection<BlogAuthor>("blog_authors"),
    comments: db.collection<BlogComment>("blog_comments"),
    settings: db.collection<SettingsDoc>("blog_settings"),
    redirects: db.collection<RedirectDoc>("blog_redirects"),
    subscribers: db.collection<SubscriberDoc>("blog_subscribers"),
  };
}

export function termCollection(c: BlogCollections, kind: TermKind) {
  return c[kind] as Collection<BlogTerm | BlogAuthor>;
}
