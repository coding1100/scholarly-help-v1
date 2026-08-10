import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

export function getAuthenticatedUserId(request: NextRequest) {
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
export function getVerifiedUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  return token ? verifyUserIdFromToken(token) : null;
}

function verifyUserIdFromToken(token: string): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("study.auth: JWT_SECRET is not configured");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload | string;
    if (typeof decoded === "string") return decoded;
    const nestedUser = decoded.user || {};
    return (
      decoded.userId ||
      decoded.user_id ||
      decoded.uid ||
      decoded.id ||
      decoded.username ||
      decoded.name ||
      decoded.sub ||
      decoded.email ||
      nestedUser.userId ||
      nestedUser.user_id ||
      nestedUser.id ||
      nestedUser.username ||
      nestedUser.email ||
      null
    );
  } catch {
    return null;
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
