import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { withBlogDb } from "@/app/lib/blog/api";
import { toPlainText } from "@/app/lib/blog/sanitize";
import { clientIpHash, countLinks, EMAIL_RE, looksAutomated } from "@/app/lib/blog/spam";
import { isPostLive } from "@/app/lib/blog/utils";
import { DEFAULT_BLOG_SETTINGS } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 3; // comments per IP...
const RATE_WINDOW_MS = 10 * 60 * 1000; // ...per 10 minutes

// POST { postId, name, email, body, website (honeypot), startedAt }
// Comments are always held for moderation; nothing is shown until an admin approves it.
export async function POST(request: NextRequest) {
  return withBlogDb(async (c) => {
    const body = (await request.json()) as Record<string, unknown>;
    // Bots get a normal-looking success so they don't retry with a different payload.
    if (looksAutomated(body)) return NextResponse.json({ ok: true, pending: true });

    const postId = typeof body.postId === "string" ? body.postId : "";
    const name = toPlainText(body.name, 80);
    const email = toPlainText(body.email, 200).toLowerCase();
    const text = toPlainText(body.body, 3000);
    if (!name || !EMAIL_RE.test(email) || text.length < 2) {
      return NextResponse.json({ error: "Please enter your name, a valid email and a comment." }, { status: 400 });
    }

    const settings = await c.settings.findOne({ _id: "settings" });
    const post = await c.posts.findOne({ _id: postId }, { projection: { status: 1, publishAt: 1, commentsEnabled: 1 } });
    const globallyEnabled = settings?.commentsEnabled ?? DEFAULT_BLOG_SETTINGS.commentsEnabled;
    if (!post || !isPostLive(post) || !post.commentsEnabled || !globallyEnabled) {
      return NextResponse.json({ error: "Comments are closed for this post." }, { status: 403 });
    }

    const ipHash = clientIpHash(request);
    const recent = await c.comments.countDocuments({
      ipHash,
      createdAt: { $gte: new Date(Date.now() - RATE_WINDOW_MS).toISOString() },
    });
    if (recent >= RATE_LIMIT) {
      return NextResponse.json({ error: "You're commenting too fast. Please try again in a few minutes." }, { status: 429 });
    }

    await c.comments.insertOne({
      _id: randomUUID(),
      postId,
      name,
      email,
      body: text,
      status: countLinks(text) > 2 ? "spam" : "pending",
      ipHash,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, pending: true }, { status: 201 });
  });
}
