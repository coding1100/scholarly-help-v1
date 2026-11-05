import { NextResponse } from "next/server";
import { withBlogDb } from "@/app/lib/blog/api";

export const dynamic = "force-dynamic";

// GET /api/admin/blog/subscribers -> CSV download of newsletter sign-ups
export async function GET() {
  return withBlogDb(async (c) => {
    const rows = await c.subscribers.find({}, { projection: { email: 1, createdAt: 1 } }).sort({ createdAt: -1 }).toArray();
    const csv = ["email,subscribed_at", ...rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.createdAt}`)].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="blog-subscribers.csv"',
      },
    });
  });
}
