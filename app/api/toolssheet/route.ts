import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type ToolsSheetPayload = {
  timestamp?: string;
  email?: string;
  phoneNumber?: string;
  fbc?: string;
  userId?: string;
  qualified?: string;
  toolUsed?: string | string[];
  device?: string;
  source?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function normalizePrivateKey(key: string): string {
  // Service account private keys are commonly stored with escaped newlines
  return key.replace(/\\n/g, "\n");
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    let body: ToolsSheetPayload;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const raw = await request.text();
      try {
        body = JSON.parse(raw) as ToolsSheetPayload;
      } catch (e) {
        console.error("Invalid JSON body received:", raw);
        return NextResponse.json(
          {
            success: false,
            message: "Invalid JSON body",
            details: e instanceof Error ? e.message : String(e),
          },
          { status: 400, headers: corsHeaders },
        );
      }
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const form = await request.formData();
      const data = Object.fromEntries(form.entries());
      body = {
        timestamp: typeof data.timestamp === "string" ? data.timestamp : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
        phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : undefined,
        fbc: typeof data.fbc === "string" ? data.fbc : undefined,
        userId: typeof data.userId === "string" ? data.userId : undefined,
        qualified: typeof data.qualified === "string" ? data.qualified : undefined,
        toolUsed:
          typeof data.toolUsed === "string"
            ? data.toolUsed
            : Array.isArray(data.toolUsed)
              ? data.toolUsed.map(String)
              : undefined,
        device: typeof data.device === "string" ? data.device : undefined,
        source: typeof data.source === "string" ? data.source : undefined,
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported Content-Type. Use application/json or multipart/form-data.",
        },
        { status: 415, headers: corsHeaders },
      );
    }

    const clientEmail = requiredEnv("GOOGLE_CLIENT_TOOL_EMAIL");
    const privateKey = normalizePrivateKey(requiredEnv("GOOGLE_PRIVATE_TOOL_KEY"));
    const spreadsheetId = requiredEnv("GOOGLE_SHEET_TOOL_ID");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties(title))",
    });

    const sheetTitle = meta.data.sheets?.[0]?.properties?.title;
    if (!sheetTitle) {
      return NextResponse.json(
        { success: false, message: "Could not determine sheet tab name" },
        { status: 500, headers: corsHeaders },
      );
    }

    const timestamp = body.timestamp || new Date().toISOString();
    const toolUsed = Array.isArray(body.toolUsed)
      ? body.toolUsed.join(", ")
      : body.toolUsed || "";

    // Sheet columns (per your screenshot):
    // Timestamp | Email | Phone Number | fbc | User ID | Qualified | Tool Used | Device | Source
    const row = [
      timestamp,
      body.email || "",
      body.phoneNumber || "",
      body.fbc || "",
      body.userId || "",
      body.qualified || "",
      toolUsed,
      body.device || "",
      body.source || "",
    ];

    const fbc = (body.fbc || "").trim();
    if (fbc) {
      // One logical row per fbclid: update existing row or append a new one.
      const dCol = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetTitle}!D:D`,
      });
      const colValues = dCol.data.values || [];
      const foundIndex0 = colValues.findIndex(
        (r) => (r[0] ?? "").toString().trim() === fbc,
      );
      const rowNumber1Based = foundIndex0 + 1;

      if (rowNumber1Based > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A${rowNumber1Based}:I${rowNumber1Based}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [row] },
        });
        return NextResponse.json(
          { success: true, message: "Row updated", mode: "update", row: rowNumber1Based },
          { headers: corsHeaders },
        );
      }
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A:I`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return NextResponse.json(
      { success: true, message: "Row appended successfully", mode: "append" },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error appending to Google Sheet:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to append row",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

