import { NextRequest, NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";

export const dynamic = "force-dynamic";

// GET /api/admin/blog/comments?status=pending|approved|spam
export async function GET(request: NextRequest) {
  return withBlogDb(async (c) => {
    const status = request.nextUrl.searchParams.get("status") || "pending";
    const comments = await c.comments
      .find({ status: status as "pending" | "approved" | "spam" }, { projection: { ipHash: 0 } })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    const postIds = [...new Set(comments.map((cm) => cm.postId))];
    const posts = await c.posts
      .find({ _id: { $in: postIds } }, { projection: { title: 1, slug: 1 } })
      .toArray();
    const counts = await c.comments
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .toArray();
    return NextResponse.json({
      comments,
      posts: Object.fromEntries(posts.map((p) => [p._id, { title: p.title, slug: p.slug }])),
      counts: Object.fromEntries(counts.map((r) => [r._id, r.count])),
    });
  });
}
