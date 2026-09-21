import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AdminSessionRole = "admin" | "report_admin";

function resolveRole(token: string | undefined): AdminSessionRole | null {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const payload = jwt.verify(token, secret, {
      issuer: "scholarlyhelp-admin",
      audience: "scholarlyhelp-admin-panel",
    }) as { role?: string };
    return payload.role === "report_admin" ? "report_admin" : "admin";
  } catch {
    return null;
  }
}

/** Signature/expiry validation is also enforced by middleware before routes run; this re-derives the role for route logic. */
export function getAdminSessionRole(request: NextRequest): AdminSessionRole | null {
  return resolveRole(request.cookies.get("sh_admin_session")?.value);
}

/** Same as getAdminSessionRole but for server components/actions, which read cookies via next/headers instead of a NextRequest. */
export function getAdminSessionRoleFromCookieValue(
  cookieValue: string | undefined,
): AdminSessionRole | null {
  return resolveRole(cookieValue);
}
