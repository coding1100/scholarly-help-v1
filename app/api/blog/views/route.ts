import { NextRequest, NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";
import { liveFilter } from "@/app/lib/blog/utils";

export const dynamic = "force-dynamic";

// POST { postId } -> { views }. The client sends this once per browser session per post.
export async function POST(request: NextRequest) {
  return withBlogDb(async (c) => {
    const body = await request.json();
    const postId = typeof body?.postId === "string" ? body.postId : "";
    const post = await c.posts.findOneAndUpdate(
      { _id: postId, ...liveFilter() },
      { $inc: { views: 1 } },
      { returnDocument: "after", projection: { views: 1 } },
    );
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ views: post.views });
  });
}
