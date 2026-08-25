import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEET_RANGE = "'TMC Landing Pages'!A:Z";

type TmcLpLandingSheetPayload = {
  email?: string;
  phone?: string;
  instructions?: string;
  formType?: "email-only" | "full-form";
  fbclid?: string;
  gclid?: string;
  landingPage?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function normalizeLandingPage(pathname: string): string {
  const trimmed = (pathname || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    let body: TmcLpLandingSheetPayload;
    try {
      body = JSON.parse(raw) as TmcLpLandingSheetPayload;
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body",
          details: e instanceof Error ? e.message : String(e),
        },
        { status: 400 },
      );
    }

    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: "Email or phone is required" },
        { status: 400 },
      );
    }

    const instructions = (body.instructions || "").trim();
    const formType = body.formType === "full-form" ? "full-form" : "email-only";
    const fbclid = (body.fbclid || "").trim();
    const gclid = (body.gclid || "").trim();
    const landingPage = normalizeLandingPage(body.landingPage || "");

    const clientEmail = requiredEnv("GOOGLE_CLIENT_TOOL_EMAIL");
    const privateKey = normalizePrivateKey(requiredEnv("GOOGLE_PRIVATE_TOOL_KEY"));
    const spreadsheetId = requiredEnv("GOOGLE_SHEET_TOOL_ID");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const timestamp = new Date().toISOString();

    // A Timestamp | B Landing Page | C Form Type | D Email | E Phone | F Instructions | G FBCLID | H GCLID
    const row = [
      timestamp,
      landingPage,
      formType,
      email,
      phone,
      instructions,
      fbclid,
      gclid,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: SHEET_RANGE,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return NextResponse.json({
      success: true,
      message: "Row appended successfully",
    });
  } catch (error) {
    console.error("Error appending to TMC Landing Pages sheet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to append row" },
      { status: 500 },
    );
  }
}
