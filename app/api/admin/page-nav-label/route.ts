import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function buildQuery(pageId: string, isDuplicate: boolean) {
  return isDuplicate
    ? {
        isDynamicLandingDuplicate: true,
        $or: [
          { id: pageId },
          { pageType: pageId },
          { dynamicLandingSlug: pageId },
          { id: `landing-dup-${pageId}` },
        ],
      }
    : {
        $or: [{ id: pageId }, { pageType: pageId }],
      };
}

export async function GET(request: NextRequest) {
  try {
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { adminNavLabel: null },
        { status: 500, headers: corsHeaders },
      );
    }

    const pageId = String(request.nextUrl.searchParams.get("pageId") || "").trim();
    const isDuplicate = request.nextUrl.searchParams.get("isDuplicate") === "true";

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const doc = await db.collection("pages").findOne(buildQuery(pageId, isDuplicate) as never, {
      projection: { adminNavLabel: 1 },
    });

    const adminNavLabel =
      typeof doc?.adminNavLabel === "string" && doc.adminNavLabel.trim()
        ? doc.adminNavLabel.trim()
        : null;

    return NextResponse.json({ adminNavLabel }, { headers: corsHeaders });
  } catch (e) {
    console.error("page-nav-label GET", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load title" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = (await request.json()) as {
      pageId?: string;
      adminNavLabel?: string;
      isDuplicate?: boolean;
    };

    const pageId = String(body.pageId || "").trim();
    const adminNavLabel = String(body.adminNavLabel || "").trim();

    if (!pageId || !adminNavLabel) {
      return NextResponse.json(
        { error: "pageId and adminNavLabel are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const isDuplicate = Boolean(body.isDuplicate);

    const result = await db.collection("pages").updateOne(
      buildQuery(pageId, isDuplicate) as never,
      {
        $set: { adminNavLabel, updatedAt: new Date().toISOString() },
        $setOnInsert: isDuplicate
          ? { id: pageId, pageType: pageId, dynamicLandingSlug: pageId, isDynamicLandingDuplicate: true }
          : { id: pageId, pageType: pageId },
      },
      { upsert: true },
    );

    return NextResponse.json(
      { success: true, adminNavLabel },
      { headers: corsHeaders },
    );
  } catch (e) {
    console.error("page-nav-label", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save title" },
      { status: 500, headers: corsHeaders },
    );
  }
}
