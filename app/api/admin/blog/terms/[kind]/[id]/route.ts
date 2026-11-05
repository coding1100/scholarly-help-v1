import { NextRequest, NextResponse } from "next/server";
import { notFound, withBlogDb } from "@/app/lib/blog/api";
import { termCollection } from "@/app/lib/blog/db";
import { normalizeTermInput } from "@/app/lib/blog/validate";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import type { TermKind } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

const KINDS: TermKind[] = ["categories", "tags", "authors"];
type Ctx = { params: Promise<{ kind: string; id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  if (!KINDS.includes(kind as TermKind)) return notFound();
  return withBlogDb(async (c) => {
    const input = normalizeTermInput(await request.json(), kind === "authors");
    const result = await termCollection(c, kind as TermKind).updateOne({ _id: id }, { $set: input });
    if (!result.matchedCount) return notFound();
    revalidateBlog();
    return NextResponse.json({ term: { _id: id, ...input } });
  });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  if (!KINDS.includes(kind as TermKind)) return notFound();
  return withBlogDb(async (c) => {
    const result = await termCollection(c, kind as TermKind).deleteOne({ _id: id });
    if (!result.deletedCount) return notFound();
    // Detach the deleted term from posts so nothing points at a missing id.
    if (kind === "categories") await c.posts.updateMany({ categoryId: id }, { $set: { categoryId: null } });
    if (kind === "authors") await c.posts.updateMany({ authorId: id }, { $set: { authorId: null } });
    if (kind === "tags") await c.posts.updateMany({ tagIds: id }, { $pull: { tagIds: id } });
    revalidateBlog();
    return NextResponse.json({ ok: true });
  });
}
