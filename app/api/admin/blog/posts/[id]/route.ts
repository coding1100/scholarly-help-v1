import { NextRequest, NextResponse } from "next/server";
import { notFound, withBlogDb } from "@/app/lib/blog/api";
import { normalizePostInput } from "@/app/lib/blog/validate";
import { revalidateBlog } from "@/app/lib/blog/revalidate";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withBlogDb(async (c) => {
    const post = await c.posts.findOne({ _id: id });
    return post ? NextResponse.json({ post }) : notFound();
  });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withBlogDb(async (c) => {
    const existing = await c.posts.findOne({ _id: id }, { projection: { slug: 1 } });
    if (!existing) return notFound();
    const input = normalizePostInput(await request.json());
    const updatedAt = new Date().toISOString();
    await c.posts.updateOne({ _id: id }, { $set: { ...input, updatedAt } });

    if (existing.slug !== input.slug) {
      // Old URL keeps working with a 301. Point earlier redirects at the new slug
      // too, and drop any redirect that would shadow the new slug.
      // Post redirects are keyed by bare slug; archive redirects ("author/x") are left alone.
      await c.redirects.updateMany({ to: existing.slug, _id: { $not: /\// } }, { $set: { to: input.slug } });
      await c.redirects.deleteOne({ _id: input.slug });
      await c.redirects.updateOne(
        { _id: existing.slug },
        { $set: { from: existing.slug, to: input.slug, createdAt: updatedAt } },
        { upsert: true },
      );
    }
    revalidateBlog();
    const post = await c.posts.findOne({ _id: id });
    return NextResponse.json({ post });
  });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withBlogDb(async (c) => {
    const result = await c.posts.deleteOne({ _id: id });
    if (!result.deletedCount) return notFound();
    await c.comments.deleteMany({ postId: id });
    revalidateBlog();
    return NextResponse.json({ ok: true });
  });
}
