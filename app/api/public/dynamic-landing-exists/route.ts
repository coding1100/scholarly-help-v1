import { NextRequest, NextResponse } from "next/server";
import { fetchPublishedDynamicLanding } from "@/app/lib/dynamicLandingPage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim() || "";
  if (!slug) {
    return NextResponse.json({ exists: false });
  }

  const doc = await fetchPublishedDynamicLanding(slug);
  return NextResponse.json(
    { exists: !!doc },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
      },
    },
  );
}
