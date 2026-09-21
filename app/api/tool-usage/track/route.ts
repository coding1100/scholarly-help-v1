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

async function fetchJson(url: string, timeoutMs: number): Promise<any | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Primary provider: HTTPS, no API key, ~1000 req/day free tier. */
async function geolocateViaIpapiCo(ip: string): Promise<GeoLookup | null> {
  const payload = await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, 2_500);
  if (!payload || payload.error) return null;
  const value: GeoLookup = {
    country: text(payload.country_name, 120),
    region: text(payload.region, 120),
    city: text(payload.city, 120),
  };
  if (!value.country && !value.region && !value.city) return null;
  return value;
}

/** Fallback provider if ipapi.co is unreachable or rate-limited. HTTP only on the free tier. */
async function geolocateViaIpApiCom(ip: string): Promise<GeoLookup | null> {
  const payload = await fetchJson(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
    2_000,
  );
  if (!payload || payload.status !== "success") return null;
  const value: GeoLookup = {
    country: text(payload.country, 120),
    region: text(payload.regionName, 120),
    city: text(payload.city, 120),
  };
  if (!value.country && !value.region && !value.city) return null;
  return value;
}

/**
 * We don't sit behind Vercel/Cloudflare (no x-vercel-ip-country, cf-ipcountry,
 * etc. headers on EC2), so those CDN headers are always absent in production.
 * This is the fallback: a server-side lookup against a free geo-IP API
 * (no API key, no client-side call). Best-effort only — on any failure or
 * timeout this resolves to {} so tracking never blocks/fails on geo data.
 * Tries an HTTPS provider first, then an HTTP-only one, in case outbound
 * plain-HTTP is restricted on the host.
 */
async function geolocateIp(ip: string | null): Promise<GeoLookup> {
  if (!ip || isPrivateIp(ip)) return {};

  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value =
    (await geolocateViaIpapiCo(ip)) || (await geolocateViaIpApiCom(ip)) || {};
  if (value.country || value.region || value.city) {
    geoCache.set(ip, { value, expiresAt: Date.now() + GEO_CACHE_TTL_MS });
  }
  return value;
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
      const resolvedIp = clientIp(request);
      const geo = await geolocateIp(resolvedIp);
      if (!geo.country && !geo.region && !geo.city) {
        console.warn("tool-usage geo lookup empty", {
          resolvedIp,
          xForwardedFor: request.headers.get("x-forwarded-for"),
          xRealIp: request.headers.get("x-real-ip"),
        });
      }
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
