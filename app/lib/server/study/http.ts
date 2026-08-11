import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

type TokenPayload = {
  userId?: string;
  user_id?: string;
  uid?: string;
  id?: string;
  username?: string;
  name?: string;
  sub?: string;
  email?: string;
  user?: {
    id?: string;
    userId?: string;
    user_id?: string;
    email?: string;
    username?: string;
  };
};

type TokenVerificationResponse = {
  valid?: boolean;
  user?: TokenPayload;
};

const TOKEN_CACHE_TTL_MS = 30_000;
const TOKEN_CACHE_MAX_ENTRIES = 256;
const verifiedTokenCache = new Map<
  string,
  { userId: string; expiresAt: number }
>();
const tokenVerificationInFlight = new Map<string, Promise<string | null>>();

export async function getAuthenticatedUserId(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (token) return verifyUserIdFromToken(token);

  const guestId = request.headers.get("x-user-id")?.trim() || "";
  if (/^guest_[a-z0-9]{12,80}$/i.test(guestId)) return guestId;

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
  return `guest:${ip.split(",")[0].trim()}`;
}

/** Registered-user identity must always come from a valid bearer token. */
export async function getVerifiedUserId(
  request: NextRequest,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  return token ? verifyUserIdFromToken(token) : null;
}

function getAuthApiBaseUrl(): string {
  return String(
    process.env.AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_NGROX_URL ||
      "",
  ).replace(/\/$/, "");
}

function tokenCacheKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function readUserId(payload: TokenPayload | string | undefined): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  const nestedUser = payload.user || {};
  return (
    payload.userId ||
    payload.user_id ||
    payload.uid ||
    payload.id ||
    payload.username ||
    payload.name ||
    payload.sub ||
    payload.email ||
    nestedUser.userId ||
    nestedUser.user_id ||
    nestedUser.id ||
    nestedUser.username ||
    nestedUser.email ||
    null
  );
}

function cacheVerifiedUser(cacheKey: string, userId: string): void {
  if (verifiedTokenCache.size >= TOKEN_CACHE_MAX_ENTRIES) {
    const oldestKey = verifiedTokenCache.keys().next().value as
      | string
      | undefined;
    if (oldestKey) verifiedTokenCache.delete(oldestKey);
  }
  verifiedTokenCache.set(cacheKey, {
    userId,
    expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
  });
}

/**
 * Access tokens are issued by the Nest/Supabase authentication service, not by
 * the Next.js admin JWT issuer. Validate them with the same authoritative
 * backend used by login and refresh. The short bounded cache avoids adding an
 * authentication round trip to every Study API call while keeping revocation
 * propagation prompt.
 */
async function verifyUserIdFromToken(token: string): Promise<string | null> {
  const cacheKey = tokenCacheKey(token);
  const cached = verifiedTokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.userId;
  if (cached) verifiedTokenCache.delete(cacheKey);

  const existing = tokenVerificationInFlight.get(cacheKey);
  if (existing) return existing;

  const verification = (async () => {
    const apiBase = getAuthApiBaseUrl();
    if (!apiBase) {
      console.error(
        "study.auth: AUTH_API_BASE_URL or NEXT_PUBLIC_API_URL is not configured",
      );
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(`${apiBase}/auth/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) return null;

      const payload = (await response.json()) as TokenVerificationResponse;
      if (!payload.valid) return null;
      const userId = readUserId(payload.user);
      if (!userId) return null;
      cacheVerifiedUser(cacheKey, userId);
      return userId;
    } catch (error) {
      console.error(
        "study.auth: token verification service unavailable",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  })();

  tokenVerificationInFlight.set(cacheKey, verification);
  try {
    return await verification;
  } finally {
    tokenVerificationInFlight.delete(cacheKey);
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}
