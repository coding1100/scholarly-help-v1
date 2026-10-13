import { NextRequest, NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";
import { liveFilter } from "@/app/lib/blog/utils";
import { getAdminSessionRole } from "@/app/lib/server/adminSession";

export const dynamic = "force-dynamic";

const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|monitor|lighthouse|headless|curl|wget|python|axios/i;

// POST { postId } -> { views }. The client sends this once per browser session per post.
// Admins (signed in to the admin panel) and bots are not counted.
export async function POST(request: NextRequest) {
  return withBlogDb(async (c) => {
    const body = await request.json();
    const postId = typeof body?.postId === "string" ? body.postId : "";
    const skip =
      BOT_UA.test(request.headers.get("user-agent") || "") ||
      getAdminSessionRole(request) !== null;
    if (skip) {
      const post = await c.posts.findOne({ _id: postId, ...liveFilter() }, { projection: { views: 1 } });
      return post ? NextResponse.json({ views: post.views, counted: false }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const post = await c.posts.findOneAndUpdate(
      { _id: postId, ...liveFilter() },
      { $inc: { views: 1 } },
      { returnDocument: "after", projection: { views: 1 } },
    );
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ views: post.views, counted: true });
  });
}
