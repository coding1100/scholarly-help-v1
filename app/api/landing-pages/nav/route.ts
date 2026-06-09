import { NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ links: [] });
    }

    const docs = await db
      .collection("pages")
      .find(
        {
          isDynamicLandingDuplicate: true,
          published: true,
          navPlacement: "header-take-my-class",
        },
        { projection: { adminNavLabel: 1, dynamicLandingSlug: 1 } },
      )
      .limit(40)
      .toArray();

    const links = docs
      .map((d) => {
        const slug = String(d.dynamicLandingSlug || "").replace(/^\/+/, "");
        if (!slug) return null;
        return {
          href: `/landing/${slug}`,
          label:
            typeof d.adminNavLabel === "string" && d.adminNavLabel.trim()
              ? d.adminNavLabel.trim()
              : slug,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ links: [] });
  }
}
