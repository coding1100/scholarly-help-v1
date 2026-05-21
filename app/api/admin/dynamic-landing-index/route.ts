import { NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";

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
        { pages: [], error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const docs = await db
      .collection("pages")
      .find(
        { isDynamicLandingDuplicate: true },
        { projection: { id: 1, adminNavLabel: 1, dynamicLandingSlug: 1 } },
      )
      .sort({ createdAt: -1 })
      .limit(80)
      .toArray();

    const pages = docs.map((d) => {
      const id = String(d.id || "");
      const label =
        typeof d.adminNavLabel === "string" && d.adminNavLabel.trim()
          ? d.adminNavLabel.trim()
          : id;
      return {
        pageId: id,
        label,
        href: `/admin/landing/${encodeURIComponent(id)}`,
        publicPath: `/landing/${encodeURIComponent(String(d.dynamicLandingSlug || "").replace(/^\/+/, ""))}`,
      };
    });

    return NextResponse.json({ pages }, { headers: corsHeaders });
  } catch (e) {
    console.error("dynamic-landing-index", e);
    return NextResponse.json(
      { pages: [], error: "Failed to list pages" },
      { status: 500, headers: corsHeaders },
    );
  }
}
