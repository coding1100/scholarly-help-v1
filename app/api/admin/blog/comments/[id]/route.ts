import { NextRequest, NextResponse } from "next/server";
import { notFound, withBlogDb } from "@/app/lib/blog/api";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import type { CommentStatus } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

const STATUSES: CommentStatus[] = ["pending", "approved", "spam"];
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withBlogDb(async (c) => {
    const body = await request.json();
    if (!STATUSES.includes(body?.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const result = await c.comments.updateOne({ _id: id }, { $set: { status: body.status } });
    if (!result.matchedCount) return notFound();
    revalidateBlog();
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withBlogDb(async (c) => {
    const result = await c.comments.deleteOne({ _id: id });
    if (!result.deletedCount) return notFound();
    revalidateBlog();
    return NextResponse.json({ ok: true });
  });
}
