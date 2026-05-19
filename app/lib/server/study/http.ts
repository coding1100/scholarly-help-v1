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
  const headerFallback =
    request.headers.get("x-user-id") ||
    request.nextUrl.searchParams.get("userId") ||
    null;
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!token) return headerFallback;

  try {
    const secret = process.env.JWT_SECRET || "default-secret";
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
    return headerFallback;
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
