import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { notFound, withBlogDb } from "@/app/lib/blog/api";
import { termCollection } from "@/app/lib/blog/db";
import { normalizeTermInput } from "@/app/lib/blog/validate";
import { revalidateBlog } from "@/app/lib/blog/revalidate";
import type { TermKind } from "@/app/lib/blog/types";

export const dynamic = "force-dynamic";

const KINDS: TermKind[] = ["categories", "tags", "authors"];
type Ctx = { params: Promise<{ kind: string }> };

// GET /api/admin/blog/terms/categories  -> terms with post counts
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { kind } = await params;
  if (!KINDS.includes(kind as TermKind)) return notFound();
  return withBlogDb(async (c) => {
    const terms = await termCollection(c, kind as TermKind).find({}).sort({ name: 1 }).toArray();
    const field = kind === "categories" ? "$categoryId" : kind === "authors" ? "$authorId" : "$tagIds";
    const pipeline =
      kind === "tags"
        ? [{ $unwind: "$tagIds" }, { $group: { _id: "$tagIds", count: { $sum: 1 } } }]
        : [{ $group: { _id: field, count: { $sum: 1 } } }];
    const counts = await c.posts.aggregate<{ _id: string; count: number }>(pipeline).toArray();
    const byId = new Map(counts.map((r) => [r._id, r.count]));
    return NextResponse.json({ terms: terms.map((t) => ({ ...t, count: byId.get(t._id) ?? 0 })) });
  });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { kind } = await params;
  if (!KINDS.includes(kind as TermKind)) return notFound();
  return withBlogDb(async (c) => {
    const input = normalizeTermInput(await request.json(), kind === "authors");
    const term = { _id: randomUUID(), ...input };
    await termCollection(c, kind as TermKind).insertOne(term);
    revalidateBlog();
    return NextResponse.json({ term }, { status: 201 });
  });
}
