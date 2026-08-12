import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getMongoDatabase } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 500;
let indexesReady: Promise<void> | null = null;

function text(value: unknown, max = MAX_FIELD_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function email(value: unknown): string | undefined {
  return text(value, 254)?.toLowerCase();
}

function hashIp(ip: string | null): string | undefined {
  const secret = process.env.TOOL_USAGE_HASH_SECRET || process.env.JWT_SECRET;
  if (!ip || !secret) return undefined;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

function headerText(request: NextRequest, names: string[], max = 120): string | undefined {
  for (const name of names) {
    const value = text(request.headers.get(name), max);
    if (value) return value;
  }
  return undefined;
}

function userKey(input: {
  userId?: string;
  userEmail?: string;
  anonymousId?: string;
}) {
  if (input.userId) return `user:${input.userId}`;
  if (input.userEmail) return `email:${input.userEmail}`;
  if (input.anonymousId) return `anon:${input.anonymousId}`;
  return "unknown";
}

async function ensureIndexes() {
  const db = await getMongoDatabase(process.env.TOOL_USAGE_DATABASE_NAME || "scholarly_help");
  if (!db) throw new Error("Database not configured");
  const collection = db.collection("tool_usage_events");
  await Promise.all([
    collection.createIndex({ toolName: 1, usedAt: -1 }),
    collection.createIndex({ userKey: 1, toolName: 1, usedAt: -1 }),
    collection.createIndex({ usedAt: -1 }),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const toolName = text(body?.toolName, 120);
    if (!toolName) {
      return NextResponse.json(
        { success: false, error: "toolName is required" },
        { status: 400 },
      );
    }

    if (!indexesReady) indexesReady = ensureIndexes();
    await indexesReady;

    const db = await getMongoDatabase(process.env.TOOL_USAGE_DATABASE_NAME || "scholarly_help");
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 },
      );
    }

    const userId = text(body?.userId, 120);
    const userEmail = email(body?.userEmail);
    const anonymousId = text(body?.anonymousId, 120);
    const usedAt = new Date();

    await db.collection("tool_usage_events").insertOne({
      toolName,
      action: text(body?.action, 80) || "generate",
      usedAt,
      userKey: userKey({ userId, userEmail, anonymousId }),
      userId,
      userEmail,
      userName: text(body?.userName, 160),
      anonymousId,
      path: text(body?.path, 300),
      search: text(body?.search, 500),
      href: text(body?.href, 500),
      referrer: text(body?.referrer, 500),
      timezone: text(body?.timezone, 120),
      language: text(body?.language, 40),
      device: text(body?.device, 40),
      country: headerText(request, ["x-vercel-ip-country", "cf-ipcountry", "x-country"]),
      region: headerText(request, ["x-vercel-ip-country-region", "x-region"]),
      city: headerText(request, ["x-vercel-ip-city", "x-city"]),
      ipHash: hashIp(clientIp(request)),
      userAgent: text(request.headers.get("user-agent"), 500),
      createdAt: usedAt,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tool usage tracking failed:", error);
    return NextResponse.json(
      { success: false, error: "Tracking failed" },
      { status: 500 },
    );
  }
}
