import type { PostViewData } from "@/app/components/Blog/PostView";
import {
  getApprovedComments,
  getBlogSettings,
  getRecentPosts,
  getRelatedPosts,
  getTermById,
  getTerms,
} from "./queries";
import type { BlogAuthor, BlogPost, BlogTerm } from "./types";

/** Loads everything the post template needs besides the post itself. */
export async function loadPostView(post: BlogPost, preview = false): Promise<PostViewData> {
  const [category, author, related, recent, categories, comments, settings] = await Promise.all([
    getTermById("categories", post.categoryId),
    getTermById("authors", post.authorId),
    getRelatedPosts(post, 3),
    getRecentPosts(post._id, 6),
    getTerms("categories"),
    preview ? Promise.resolve([]) : getApprovedComments(post._id),
    getBlogSettings(),
  ]);
  return {
    post,
    category: category as BlogTerm | null,
    author: author as BlogAuthor | null,
    related,
    recent,
    categories,
    comments,
    commentsOpen: settings.commentsEnabled && post.commentsEnabled,
    preview,
  };
}
