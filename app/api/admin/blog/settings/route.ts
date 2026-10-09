import { NextRequest, NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import { safeUrl, toPlainText } from "@/app/lib/blog/sanitize";
import { DEFAULT_BLOG_SETTINGS, type BlogSettings } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return withBlogDb(async (c) => {
    const doc = await c.settings.findOne({ _id: "settings" });
    const { _id, ...stored } = doc ?? { _id: "settings" };
    const subscriberCount = await c.subscribers.countDocuments();
    return NextResponse.json({ settings: { ...DEFAULT_BLOG_SETTINGS, ...stored }, subscriberCount });
  });
}

export async function PUT(request: NextRequest) {
  return withBlogDb(async (c) => {
    const body = await request.json();
    const settings: BlogSettings = {
      commentsEnabled: body?.commentsEnabled !== false,
      indexTitle: toPlainText(body?.indexTitle, 120) || DEFAULT_BLOG_SETTINGS.indexTitle,
      indexIntro: (Array.isArray(body?.indexIntro) ? body.indexIntro : [])
        .map((p: unknown) => toPlainText(p, 1000))
        .filter(Boolean)
        .slice(0, 5),
      indexImageUrl: safeUrl(body?.indexImageUrl),
    };
    await c.settings.updateOne({ _id: "settings" }, { $set: settings }, { upsert: true });
    revalidateBlog();
    return NextResponse.json({ settings });
  });
}
