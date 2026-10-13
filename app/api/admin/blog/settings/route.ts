import { NextRequest, NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import { normalizeSettingsInput } from "@/app/lib/blog/validate";
import { DEFAULT_BLOG_SETTINGS } from "@/app/lib/blog/types";

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
    const settings = normalizeSettingsInput(await request.json());
    await c.settings.updateOne({ _id: "settings" }, { $set: settings }, { upsert: true });
    revalidateBlog();
    return NextResponse.json({ settings });
  });
}
