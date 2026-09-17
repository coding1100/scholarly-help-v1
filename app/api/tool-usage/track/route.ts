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

type GeoLookup = { country?: string; region?: string; city?: string };

const GEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h: an IP's geolocation rarely changes within a session.
const geoCache = new Map<string, { value: GeoLookup; expiresAt: number }>();

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

/**
 * We don't sit behind Vercel/Cloudflare (no x-vercel-ip-country, cf-ipcountry,
 * etc. headers on EC2), so those CDN headers are always absent in production.
 * This is the fallback: a server-side lookup against a free geo-IP API
 * (no API key, no client-side call). Best-effort only — on any failure or
 * timeout this resolves to {} so tracking never blocks/fails on geo data.
 */
async function geolocateIp(ip: string | null): Promise<GeoLookup> {
  if (!ip || isPrivateIp(ip)) return {};

  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2_000);
  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: controller.signal },
    );
    if (!response.ok) return {};
    const payload = (await response.json()) as {
      status?: string;
      country?: string;
      regionName?: string;
      city?: string;
    };
    if (payload.status !== "success") return {};

    const value: GeoLookup = {
      country: text(payload.country, 120),
      region: text(payload.regionName, 120),
      city: text(payload.city, 120),
    };
    geoCache.set(ip, { value, expiresAt: Date.now() + GEO_CACHE_TTL_MS });
    return value;
  } catch {
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
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

    // CDN-injected headers first (present on Vercel/Cloudflare); this app
    // runs on plain EC2, so those are normally absent and we fall back to a
    // server-side geo-IP lookup instead.
    let country = headerText(request, ["x-vercel-ip-country", "cf-ipcountry", "x-country"]);
    let region = headerText(request, ["x-vercel-ip-country-region", "x-region"]);
    let city = headerText(request, ["x-vercel-ip-city", "x-city"]);
    if (!country && !region && !city) {
      const geo = await geolocateIp(clientIp(request));
      country = geo.country;
      region = geo.region;
      city = geo.city;
    }

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
      country,
      region,
      city,
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
