import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { withBlogDb } from "@/app/lib/blog/api";
import { normalizePostInput } from "@/app/lib/blog/validate";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import type { BlogPost } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

// GET /api/admin/blog/posts?q=&status=draft|published|scheduled&categoryId=
export async function GET(request: NextRequest) {
  return withBlogDb(async (c) => {
    const params = request.nextUrl.searchParams;
    const query: Record<string, unknown> = {};
    const q = params.get("q")?.trim();
    if (q) query.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const status = params.get("status");
    const now = new Date().toISOString();
    if (status === "draft") query.status = "draft";
    if (status === "published") Object.assign(query, { status: "published", publishAt: { $lte: now } });
    if (status === "scheduled") Object.assign(query, { status: "published", publishAt: { $gt: now } });
    const categoryId = params.get("categoryId");
    if (categoryId) query.categoryId = categoryId;

    const posts = await c.posts
      .find(query, {
        projection: { title: 1, slug: 1, status: 1, publishAt: 1, categoryId: 1, authorId: 1, updatedAt: 1, views: 1, importedViews: 1 },
      })
      .sort({ updatedAt: -1 })
      .limit(1000)
      .toArray();
    return NextResponse.json({ posts });
  });
}

export async function POST(request: NextRequest) {
  return withBlogDb(async (c) => {
    const input = normalizePostInput(await request.json());
    const now = new Date().toISOString();
    const post: BlogPost = { _id: randomUUID(), ...input, views: 0, createdAt: now, updatedAt: now };
    await c.posts.insertOne(post);
    revalidateBlog();
    return NextResponse.json({ post }, { status: 201 });
  });
}
