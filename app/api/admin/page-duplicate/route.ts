import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";
import {
  ADMIN_PAGE_ROUTES,
  getAdminPageRouteConfig,
  type AdminNavParent,
} from "@/app/lib/adminPageRoutes";
import {
  buildSourceIdCandidates,
  findSourceDocument,
} from "@/app/lib/duplicatePageStore";
import { dynamicLandingPublicPath } from "@/app/lib/dynamicLandingPage";
import { STATIC_ADMIN_SLUGS } from "@/app/lib/adminDuplicatePageRegistry";

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
  if (STATIC_ADMIN_SLUGS.has(s)) return null;
  const reserved = new Set(["api", "login", "landing", "_next", "static"]);
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
      adminPath?: string;
      sourcePageId?: string;
      publicSlug?: string;
      adminNavLabel?: string;
      parentNav?: AdminNavParent;
    };

    const adminPath = String(body.adminPath || "").replace(/\/+$/, "");
    const route =
      getAdminPageRouteConfig(adminPath) ||
      ADMIN_PAGE_ROUTES.find((r) => r.adminPath === adminPath);
    if (!route) {
      return NextResponse.json(
        { error: "Unknown admin page route" },
        { status: 400, headers: corsHeaders },
      );
    }

    const sourceIds = buildSourceIdCandidates(route, body.sourcePageId);
    const slug = normalizeSlug(String(body.publicSlug || ""));
    const adminNavLabel = String(body.adminNavLabel || "").trim() || slug;
    if (route.parentNav !== "pages") {
      return NextResponse.json(
        { error: "Only Pages menu editors can be duplicated" },
        { status: 400, headers: corsHeaders },
      );
    }
    const parentNav: AdminNavParent = "pages";

    if (sourceIds.length === 0 || !slug) {
      return NextResponse.json(
        { error: "sourcePageId and a valid publicSlug are required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const source = await findSourceDocument(db, route.collection, sourceIds);
    if (!source) {
      return NextResponse.json(
        {
          error: `Source page not found (tried: ${sourceIds.join(", ")})`,
        },
        { status: 404, headers: corsHeaders },
      );
    }

    const existing = await db.collection("pages").findOne({
      $or: [
        { id: slug },
        { pageType: slug },
        { dynamicLandingSlug: slug },
        { id: `landing-dup-${slug}` },
      ],
    });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists. Choose another URL slug." },
        { status: 409, headers: corsHeaders },
      );
    }

    const sourceClone = JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
    const { _id, ...rest } = sourceClone;
    void _id;

    const landingUseHeroForm2 =
      route.adminPath.includes("professor") || route.adminPath.includes("still-doing");

    const newDoc = {
      ...rest,
      id: slug,
      pageType: slug,
      slug,
      isDynamicLandingDuplicate: true,
      duplicatedFrom: sourceIds[0],
      duplicatedFromCollection: route.collection,
      duplicatedFromAdminPath: route.adminPath,
      dynamicLandingSlug: slug,
      adminNavLabel,
      adminParentNav: parentNav,
      adminParentSlug: route.adminPath.replace("/admin/", ""),
      navPlacement: "none",
      published: false,
      landingUseHeroForm2,
      createdAt: new Date().toISOString(),
    };

    await db.collection("pages").insertOne(newDoc);

    const adminEditorPath = `/admin/${encodeURIComponent(slug)}`;

    return NextResponse.json(
      {
        success: true,
        pageId: slug,
        adminPath: adminEditorPath,
        publicPath: dynamicLandingPublicPath(slug),
        parentNav,
      },
      { headers: corsHeaders },
    );
  } catch (e) {
    console.error("page-duplicate", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Duplicate failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
