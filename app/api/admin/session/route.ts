import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Signature/expiry validation is enforced by middleware before this route.
export async function GET(request: NextRequest) {
  const token = request.cookies.get("sh_admin_session")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secret, {
      issuer: "scholarlyhelp-admin",
      audience: "scholarlyhelp-admin-panel",
    }) as { username?: string; role?: string };

    return NextResponse.json({
      authenticated: true,
      username: payload.username,
      role: payload.role === "report_admin" ? "report_admin" : "admin",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
