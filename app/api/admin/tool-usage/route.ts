import { NextRequest, NextResponse } from "next/server";
import {
  getToolUsageReport,
  parseToolUsageFilters,
} from "@/app/lib/server/toolUsageReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const filters = parseToolUsageFilters(request.nextUrl.searchParams);
    const report = await getToolUsageReport(filters);
    return NextResponse.json({
      ...report,
      rows: report.rows.map((row) => ({
        ...row,
        firstUsedAt: row.firstUsedAt.toISOString(),
        lastUsedAt: row.lastUsedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Tool usage report failed:", error);
    return NextResponse.json(
      { error: "Failed to load tool usage report" },
      { status: 500 },
    );
  }
}
