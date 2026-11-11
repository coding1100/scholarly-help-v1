import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getMongoDatabase } from "@/app/lib/mongodb";
import { getClientIp } from "@/app/lib/server/study/http";
import { TOOL_USAGE_TOOL_OPTIONS } from "@/app/lib/server/toolUsageReport";
import { bearerToken, verifyUserAccessToken } from "@/app/lib/server/userAccessToken";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 500;

// Every body field is browser-controlled, so each one is either checked
// against a fixed list or must parse as the exact shape the client sends.
// Anything else is dropped, never stored as free text.
const KNOWN_TOOL_NAMES: ReadonlySet<string> = new Set(TOOL_USAGE_TOOL_OPTIONS);
const KNOWN_ACTIONS: ReadonlySet<string> = new Set([
  "generate",
  "chat",
  "add_source",
  "extract_file",
  "extract_text",
  // Study workspace artifact types (StudyArtifactType).
  "outline",
  "syllabus",
  "notes",
  "summary",
  "flashcards",
  "quizzes",
]);
const KNOWN_DEVICES: ReadonlySet<string> = new Set(["mobile", "tablet", "desktop"]);
// Marketing parameters worth keeping from the page's query string.
const KNOWN_SEARCH_PARAMS: ReadonlySet<string> = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "msclkid",
  "ttclid",
]);
// Campaign names hold letters, digits, spaces and light punctuation. Quotes,
// operators and markup characters are what injection payloads need.
const SEARCH_VALUE_PATTERN = /^[\p{L}\p{N} ._~+|:,()-]{1,200}$/u;
// The client mints a crypto.randomUUID(), or a base36 timestamp-random pair
// where randomUUID is unavailable.
const ANONYMOUS_ID_PATTERN = /^[a-z0-9-]{8,64}$/i;
// A site path: slash-separated segments that never start with a dot.
const PATH_PATTERN = /^(?:\/[A-Za-z0-9_~-][A-Za-z0-9._~-]*)*\/?$/;
const TIME_ZONE_PATTERN = /^[A-Za-z0-9_+:\/-]{1,64}$/;
const LANGUAGE_PATTERN = /^[A-Za-z0-9-]{2,35}$/;

// One tool run posts one event, so a real visitor stays far below this.
// PM2 runs a single process, so an in-memory window covers all traffic.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_EVENTS = 120;
const RATE_LIMIT_MAX_CLIENTS = 10_000;
const rateWindows = new Map<string, { count: number; resetAt: number }>();

let indexesReady: Promise<void> | null = null;

function text(value: unknown, max = MAX_FIELD_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function matching(value: unknown, pattern: RegExp): string | undefined {
  return typeof value === "string" && pattern.test(value) ? value : undefined;
}

function listed(value: unknown, allowed: ReadonlySet<string>): string | undefined {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

function sitePath(value: unknown): string | undefined {
  const path = matching(value, PATH_PATTERN);
  return path && path.length <= 300 ? path : undefined;
}

/** Keeps only known marketing parameters whose values look like campaign data. */
function marketingSearch(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2_000) return undefined;
  const kept = new URLSearchParams();
  for (const [key, paramValue] of new URLSearchParams(value)) {
    if (KNOWN_SEARCH_PARAMS.has(key) && SEARCH_VALUE_PATTERN.test(paramValue)) {
      kept.set(key, paramValue);
    }
  }
  const search = kept.toString();
  return search ? `?${search}` : undefined;
}

/** The referring site's origin only: paths and queries can carry anything. */
function referrerOrigin(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2_000) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

function timeZone(value: unknown): string | undefined {
  const zone = matching(value, TIME_ZONE_PATTERN);
  if (!zone) return undefined;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone;
  } catch {
    return undefined;
  }
}

function language(value: unknown): string | undefined {
  const tag = matching(value, LANGUAGE_PATTERN);
  if (!tag) return undefined;
  try {
    return Intl.getCanonicalLocales(tag)[0];
  } catch {
    return undefined;
  }
}

function consumeRateLimit(clientKey: string, now = Date.now()): boolean {
  const current = rateWindows.get(clientKey);
  if (current && current.resetAt > now) {
    if (current.count >= RATE_LIMIT_MAX_EVENTS) return false;
    current.count += 1;
    return true;
  }
  if (rateWindows.size >= RATE_LIMIT_MAX_CLIENTS) {
    for (const [key, window] of rateWindows) {
      if (window.resetAt <= now) rateWindows.delete(key);
    }
    // Every tracked client is still inside its window: drop the oldest entry
    // so memory stays bounded.
    if (rateWindows.size >= RATE_LIMIT_MAX_CLIENTS) {
      const oldestKey = rateWindows.keys().next().value;
      if (oldestKey !== undefined) rateWindows.delete(oldestKey);
    }
  }
  rateWindows.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  return true;
}

function hashIp(ip: string | null): string | undefined {
  const secret = process.env.TOOL_USAGE_HASH_SECRET || process.env.JWT_SECRET;
  if (!ip || !secret) return undefined;
  return createHmac("sha256", secret).update(ip).digest("hex");
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
 * Location comes only from a server-side lookup of the client IP. The app runs
 * on EC2 behind nginx, not a CDN, so geo request headers (x-vercel-ip-*,
 * cf-ipcountry, x-country, x-city) would be whatever the caller chose to send.
 * Best-effort only: on any failure or timeout this resolves to {} so tracking
 * never fails on geo data. Tries an HTTPS provider first, then an HTTP-only
 * one, in case outbound plain HTTP is restricted on the host.
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

function userKey(input: { userId?: string; anonymousId?: string }) {
  if (input.userId) return `user:${input.userId}`;
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
    const resolvedIp = getClientIp(request);
    if (!consumeRateLimit(hashIp(resolvedIp) || resolvedIp || "unknown")) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const toolName = text(body?.toolName, 120);
    if (!toolName || !KNOWN_TOOL_NAMES.has(toolName)) {
      return NextResponse.json(
        { success: false, error: "Unknown toolName" },
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

    // Identity comes from the access token only. userId, userEmail and
    // userName in the body are browser-controlled (and userId holds a guest_
    // id for guests), so they are never trusted.
    const token = bearerToken(request);
    const verifiedUser = token ? await verifyUserAccessToken(token) : null;
    const anonymousId = verifiedUser
      ? undefined
      : matching(body?.anonymousId, ANONYMOUS_ID_PATTERN);
    const usedAt = new Date();

    const geo = await geolocateIp(resolvedIp);
    if (!geo.country && !geo.region && !geo.city) {
      console.warn("tool-usage geo lookup empty", { resolvedIp });
    }

    await db.collection("tool_usage_events").insertOne({
      toolName,
      action: listed(body?.action, KNOWN_ACTIONS) || "generate",
      usedAt,
      userType: verifiedUser ? "registered" : "guest",
      userKey: userKey({ userId: verifiedUser?.userId, anonymousId }),
      userId: verifiedUser?.userId,
      userEmail: verifiedUser?.email,
      userName: verifiedUser?.name,
      anonymousId,
      path: sitePath(body?.path),
      search: marketingSearch(body?.search),
      referrer: referrerOrigin(body?.referrer),
      timezone: timeZone(body?.timezone),
      language: language(body?.language),
      device: listed(body?.device, KNOWN_DEVICES),
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ipHash: hashIp(resolvedIp),
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
