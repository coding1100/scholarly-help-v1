import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHEET_RANGE = "'Send SMS Tracking'!A:Z";

type SmsTrackingPayload = {
  fbclid?: string;
  userId?: string;
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

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    let body: SmsTrackingPayload;
    try {
      body = JSON.parse(raw) as SmsTrackingPayload;
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

    const fbclid = (body.fbclid || "").trim();
    const userId = (body.userId || "").trim();
    const landingPage = (body.landingPage || "").trim();

    // A row is only meaningful with the fbclid + Reference ID (userId) match key.
    if (!fbclid || !userId) {
      return NextResponse.json(
        { success: false, message: "fbclid and userId are required" },
        { status: 400 },
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
    const timestamp = new Date().toISOString();

    // Columns per the "Send SMS Tracking" header:
    // A Timestamp | B Fbclid | C Email | D Message | E Phone No
    // F Click Text Us | G User ID | H Phone Number | I Landing Page
    const row = [
      timestamp, // A Timestamp
      fbclid, // B Fbclid
      "", // C Email (filled later, from inbound)
      "", // D Message (filled later, from inbound SMS)
      "", // E Phone No
      "Yes", // F Click Text Us
      userId, // G User ID (UUID = SMS Reference ID)
      "", // H Phone Number (filled later, inbound sender)
      landingPage, // I Landing Page (full URL; UTMs preserved here)
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
    console.error("Error appending to Send SMS Tracking sheet:", error);
    // No server logs available, so surface the real reason in the response.
    // googleapis nests the useful message under response.data.error; fall back
    // to error.message. Also report which env vars are present (names only, no
    // values) to catch a stale/empty PM2 env quickly.
    const err = error as {
      message?: string;
      response?: { data?: { error?: { message?: string }; error_description?: string } };
    };
    const detail =
      err?.response?.data?.error?.message ||
      err?.response?.data?.error_description ||
      err?.message ||
      String(error);
    const envPresent = {
      GOOGLE_CLIENT_TOOL_EMAIL: Boolean(process.env.GOOGLE_CLIENT_TOOL_EMAIL),
      GOOGLE_PRIVATE_TOOL_KEY: Boolean(process.env.GOOGLE_PRIVATE_TOOL_KEY),
      GOOGLE_SHEET_TOOL_ID: Boolean(process.env.GOOGLE_SHEET_TOOL_ID),
    };
    return NextResponse.json(
      { success: false, message: "Failed to append row", detail, envPresent },
      { status: 500 },
    );
  }
}
