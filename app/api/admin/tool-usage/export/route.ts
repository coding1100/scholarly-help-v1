import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import {
  getToolUsageReport,
  parseToolUsageFilters,
  type ToolUsageReportRow,
} from "@/app/lib/server/toolUsageReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sheetName(value: string, fallback: string) {
  const cleaned = value.replace(/[:\\/?*\[\]]/g, " ").replace(/\s+/g, " ").trim();
  return (cleaned || fallback).slice(0, 31);
}

function userLabel(row: ToolUsageReportRow) {
  return row.userEmail || row.userName || row.userId || row.anonymousId || row.userKey;
}

function formatDate(value: Date) {
  return value.toISOString().replace("T", " ").slice(0, 19);
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF283C88" },
  };
  row.alignment = { vertical: "middle" };
}

function formatWorksheet(sheet: ExcelJS.Worksheet) {
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };
  for (let index = 1; index <= sheet.columnCount; index += 1) {
    const column = sheet.getColumn(index);
    let width = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      width = Math.max(width, String(cell.value || "").length + 2);
    });
    column.width = Math.min(width, 42);
  }
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseToolUsageFilters(request.nextUrl.searchParams);
    const report = await getToolUsageReport(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ScholarlyHelp";
    workbook.created = new Date();
    workbook.modified = new Date();

    const summary = workbook.addWorksheet("Summary");
    summary.addRow(["Metric", "Value"]);
    styleHeader(summary.getRow(1));
    summary.addRows([
      ["Total users", report.summary.totalUsers],
      ["Total tools", report.summary.totalTools],
      ["Total usage", report.summary.totalUsage],
      ["Most used tool", report.summary.mostUsedTool || ""],
      ["Most active user", report.summary.mostActiveUser || ""],
      ["Generated at", formatDate(new Date())],
    ]);
    formatWorksheet(summary);

    const rowsByTool = new Map<string, ToolUsageReportRow[]>();
    for (const row of report.rows) {
      const list = rowsByTool.get(row.toolName) || [];
      list.push(row);
      rowsByTool.set(row.toolName, list);
    }

    if (rowsByTool.size === 0) {
      const empty = workbook.addWorksheet("No Usage");
      empty.addRow([
        "User",
        "User Type",
        "Email",
        "User ID",
        "Anonymous ID",
        "Country",
        "Region",
        "City",
        "Tool",
        "Usage Count",
        "First Used At",
        "Last Used At",
      ]);
      styleHeader(empty.getRow(1));
      formatWorksheet(empty);
    }

    let index = 1;
    for (const [toolName, rows] of rowsByTool) {
      const sheet = workbook.addWorksheet(sheetName(toolName, `Tool ${index}`));
      sheet.addRow([
        "User",
        "User Type",
        "Email",
        "User ID",
        "Anonymous ID",
        "Country",
        "Region",
        "City",
        "Tool",
        "Usage Count",
        "First Used At",
        "Last Used At",
      ]);
      styleHeader(sheet.getRow(1));
      for (const row of rows) {
        sheet.addRow([
          userLabel(row),
          row.userType,
          row.userEmail || "",
          row.userId || "",
          row.anonymousId || "",
          row.country || "",
          row.region || "",
          row.city || "",
          row.toolName,
          row.usageCount,
          formatDate(row.firstUsedAt),
          formatDate(row.lastUsedAt),
        ]);
      }
      formatWorksheet(sheet);
      index += 1;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `tool-usage-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Tool usage export failed:", error);
    return NextResponse.json(
      { error: "Failed to export tool usage report" },
      { status: 500 },
    );
  }
}
