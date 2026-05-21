import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";
import { findDuplicateDocument } from "@/app/lib/duplicatePageStore";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

function slugFromLegacyPageId(pageId: string): string | null {
  if (!pageId.startsWith("landing-dup-")) return null;
  return pageId.replace(/^landing-dup-/, "");
}

function removeImageFields(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeImageFields(item));
  }
  if (obj && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const k = key.toLowerCase();
      if (
        k.includes("icon") ||
        k.includes("image") ||
        k.includes("img") ||
        key === "formBackImg2" ||
        key === "imge"
      ) {
        continue;
      }
      cleaned[key] = removeImageFields(value);
    }
    return cleaned;
  }
  return obj;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const pageId = decodeURIComponent(params.pageId || "");
    const slug = slugFromLegacyPageId(pageId);
    if (!slug) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400, headers: corsHeaders });
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({}, { status: 500, headers: corsHeaders });
    }

    const content = await findDuplicateDocument(db, slug);
    return NextResponse.json(content || {}, { headers: corsHeaders });
  } catch (e) {
    console.error("dynamic-landing GET", e);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const pageId = decodeURIComponent(params.pageId || "");
    const slug = slugFromLegacyPageId(pageId);
    if (!slug) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400, headers: corsHeaders });
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await request.json();
    const { _id, slug: _slug, id, ...updateData } = body as Record<string, unknown>;
    void _id;
    void _slug;
    void id;

    const cleanedData = removeImageFields(updateData) as Record<string, unknown>;

    const query = {
      isDynamicLandingDuplicate: true,
      $or: [
        { id: slug },
        { pageType: slug },
        { dynamicLandingSlug: slug },
        { id: pageId },
        { pageType: pageId },
      ],
    };

    const dataToSave = {
      ...cleanedData,
      id: slug,
      pageType: slug,
      dynamicLandingSlug: slug,
      isDynamicLandingDuplicate: true,
    };

    const result = await db.collection("pages").replaceOne(query as never, dataToSave as never, {
      upsert: false,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(
      { success: true, message: "Data saved successfully", modifiedCount: result.modifiedCount },
      { headers: corsHeaders },
    );
  } catch (e) {
    console.error("dynamic-landing POST", e);
    return NextResponse.json(
      { error: "Failed to save", details: e instanceof Error ? e.message : "Unknown" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { pageId: string } },
) {
  try {
    const pageId = decodeURIComponent(params.pageId || "");
    const slug = slugFromLegacyPageId(pageId);
    if (!slug) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400, headers: corsHeaders });
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const result = await db.collection("pages").deleteOne({
      isDynamicLandingDuplicate: true,
      $or: [{ id: slug }, { dynamicLandingSlug: slug }, { id: pageId }],
    } as never);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (e) {
    console.error("dynamic-landing DELETE", e);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500, headers: corsHeaders },
    );
  }
}
