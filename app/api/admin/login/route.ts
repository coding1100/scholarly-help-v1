import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;
    if (!configuredUsername || !configuredPassword || !jwtSecret) {
      return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
    }
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !safeEqual(username, configuredUsername) ||
      !safeEqual(password, configuredPassword)
    ) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ username: configuredUsername, role: "admin" }, jwtSecret, {
      expiresIn: "1h",
      issuer: "scholarlyhelp-admin",
      audience: "scholarlyhelp-admin-panel",
    });
    const response = NextResponse.json({ success: true });
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
