import { NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";
import type { AdminNavParent } from "@/app/lib/adminPageRoutes";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { main: [], pages: [] },
        { status: 500, headers: corsHeaders },
      );
    }

    const docs = await db
      .collection("pages")
      .find(
        { isDynamicLandingDuplicate: true },
        {
          projection: {
            id: 1,
            adminNavLabel: 1,
            dynamicLandingSlug: 1,
            adminParentNav: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .limit(120)
      .toArray();

    const main: Array<{ name: string; href: string }> = [];
    const pages: Array<{ name: string; href: string }> = [];

    for (const d of docs) {
      const rawId = String(d.id || "");
      const slug =
        typeof d.dynamicLandingSlug === "string" && d.dynamicLandingSlug.trim()
          ? d.dynamicLandingSlug.trim()
          : rawId.startsWith("landing-dup-")
            ? rawId.replace(/^landing-dup-/, "")
            : rawId;
      const label =
        typeof d.adminNavLabel === "string" && d.adminNavLabel.trim()
          ? d.adminNavLabel.trim()
          : slug;
      const parentNav = (d.adminParentNav as AdminNavParent) || "pages";
      const entry = {
        name: label,
        href: `/admin/${encodeURIComponent(slug)}`,
      };
      if (parentNav === "main") main.push(entry);
      else pages.push(entry);
    }

    return NextResponse.json({ main, pages }, { headers: corsHeaders });
  } catch (e) {
    console.error("page-duplicate-index", e);
    return NextResponse.json(
      { main: [], pages: [] },
      { status: 500, headers: corsHeaders },
    );
  }
}
