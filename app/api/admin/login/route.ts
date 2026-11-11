import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { getClientIp } from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";

// One shared password per role, so cap guesses per client IP. The app runs as
// a single process (PM2 fork mode), so an in-memory window covers all traffic.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function lockedForSeconds(clientKey: string, now: number): number {
  const entry = failedAttempts.get(clientKey);
  if (!entry || entry.resetAt <= now) return 0;
  return entry.count >= MAX_FAILED_ATTEMPTS ? Math.ceil((entry.resetAt - now) / 1000) : 0;
}

function recordFailure(clientKey: string, now: number): void {
  for (const [key, entry] of failedAttempts) {
    if (entry.resetAt <= now) failedAttempts.delete(key);
  }
  const entry = failedAttempts.get(clientKey);
  if (entry) entry.count += 1;
  else failedAttempts.set(clientKey, { count: 1, resetAt: now + LOCKOUT_WINDOW_MS });
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const clientKey = getClientIp(request) || "unknown";
  const retryAfter = lockedForSeconds(clientKey, Date.now());
  if (retryAfter > 0) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    const { username, password } = await request.json();
    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const reportUsername = process.env.REPORT_ADMIN_USERNAME;
    const reportPassword = process.env.REPORT_ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;
    const adminConfigured = Boolean(configuredUsername && configuredPassword);
    const reportConfigured = Boolean(reportUsername && reportPassword);
    if ((!adminConfigured && !reportConfigured) || !jwtSecret) {
      return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      recordFailure(clientKey, Date.now());
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isAdmin =
      adminConfigured &&
      safeEqual(username, configuredUsername as string) &&
      safeEqual(password, configuredPassword as string);
    const isReportAdmin =
      reportConfigured &&
      safeEqual(username, reportUsername as string) &&
      safeEqual(password, reportPassword as string);

    if (!isAdmin && !isReportAdmin) {
      recordFailure(clientKey, Date.now());
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    failedAttempts.delete(clientKey);

    const role = isAdmin ? "admin" : "report_admin";
    const token = jwt.sign({ username, role }, jwtSecret, {
      expiresIn: "1h",
      issuer: "scholarlyhelp-admin",
      audience: "scholarlyhelp-admin-panel",
    });
    const response = NextResponse.json({
      success: true,
      role,
      redirectTo: role === "report_admin" ? "/admin/tool-usage" : "/admin",
    });
    response.cookies.set("sh_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }
}
