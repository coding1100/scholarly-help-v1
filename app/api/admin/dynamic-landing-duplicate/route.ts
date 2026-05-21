import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

function normalizeSlug(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  if (s.length < 2) return null;
  const reserved = new Set([
    "api",
    "admin",
    "login",
    "landing",
    "tools",
    "_next",
    "static",
  ]);
  if (reserved.has(s)) return null;
  return s;
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
      sourcePageId?: string;
      publicSlug?: string;
      adminNavLabel?: string;
      navPlacement?: "header-take-my-class" | "none";
    };

    const sourcePageId = String(body.sourcePageId || "").trim();
    const slug = normalizeSlug(String(body.publicSlug || ""));
    const adminNavLabel = String(body.adminNavLabel || "").trim() || slug;
    const navPlacement =
      body.navPlacement === "header-take-my-class" ? "header-take-my-class" : "none";

    if (!sourcePageId || !slug) {
      return NextResponse.json(
        { error: "sourcePageId and a valid publicSlug (2+ chars, a-z0-9-) are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const source = await db.collection("pages").findOne({
      $or: [{ id: sourcePageId }, { pageType: sourcePageId }],
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source page not found in database" },
        { status: 404, headers: corsHeaders },
      );
    }

    const pageId = `landing-dup-${slug}`;

    const existing = await db.collection("pages").findOne({
      $or: [{ id: pageId }, { pageType: pageId }, { dynamicLandingSlug: slug }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists. Choose another URL slug." },
        { status: 409, headers: corsHeaders },
      );
    }

    const { _id, ...rest } = source as Record<string, unknown>;

    const landingUseHeroForm2 =
      sourcePageId.includes("professor") || sourcePageId.includes("still-doing");

    const newDoc = {
      ...rest,
      id: pageId,
      pageType: pageId,
      isDynamicLandingDuplicate: true,
      duplicatedFrom: sourcePageId,
      dynamicLandingSlug: slug,
      adminNavLabel,
      navPlacement,
      published: false,
      landingUseHeroForm2,
      createdAt: new Date().toISOString(),
    };

    await db.collection("pages").insertOne(newDoc);

    return NextResponse.json(
      {
        success: true,
        pageId,
        adminPath: `/admin/landing/${encodeURIComponent(pageId)}`,
        publicPath: `/landing/${encodeURIComponent(slug)}`,
      },
      { headers: corsHeaders },
    );
  } catch (e) {
    console.error("dynamic-landing-duplicate", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Duplicate failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
