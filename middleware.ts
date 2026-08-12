import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSinglePathSegment,
  isReservedTopLevelSegment,
} from "@/app/lib/staticPublicRoutes";

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(
    atob(padded),
    (character) => character.charCodeAt(0),
  ).buffer as ArrayBuffer;
}

type AdminSessionRole = "admin" | "report_admin";

const REPORT_ADMIN_ALLOWED_PATHS = [
  "/admin/tool-usage",
  "/api/admin/tool-usage",
  "/api/admin/session",
  "/api/admin/logout",
] as const;

function isReportAdminAllowedPath(pathname: string): boolean {
  return REPORT_ADMIN_ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

async function getAdminSessionRole(
  token: string | undefined,
): Promise<AdminSessionRole | null> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!validSignature) return null;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    const validRole = payload?.role === "admin" || payload?.role === "report_admin";
    if (
      validRole &&
      payload?.iss === "scholarlyhelp-admin" &&
      payload?.aud === "scholarlyhelp-admin-panel" &&
      Number(payload?.exp) * 1000 > Date.now()
    ) {
      return payload.role;
    }
    return null;
  } catch {
    return null;
  }
}

/** Rewrite unknown single-segment paths to /landing/{slug}/ (published check runs in the page). */
function maybeRewriteDynamicLanding(
  request: NextRequest,
): NextResponse | null {
  const segment = getSinglePathSegment(request.nextUrl.pathname);
  if (!segment || isReservedTopLevelSegment(segment)) {
    return null;
  }

  const rewriteUrl = new URL(
    `/landing/${encodeURIComponent(segment)}/`,
    request.url,
  );
  rewriteUrl.search = request.nextUrl.search;
  return NextResponse.rewrite(rewriteUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminLogin =
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/login/";
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin/");
  if (isAdminPath && !isAdminLogin) {
    const role = await getAdminSessionRole(request.cookies.get("sh_admin_session")?.value);
    if (!role) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (role === "report_admin" && !isReportAdminAllowedPath(pathname)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin/tool-usage", request.url));
    }
  }
  // All AI tools are now usable by guests. Guest usage is bounded per-visitor by
  // a global client-side click allowance (see guestClickLimits) that opens an
  // in-app sign-in / sign-up gate on the 5th AI action — so there is no longer a
  // blanket middleware auth redirect for /tools/* routes.
  const landingRewrite = maybeRewriteDynamicLanding(request);
  if (landingRewrite) return landingRewrite;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tools/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    /*
     * Single-segment public paths (e.g. /take-my-proctored-exam-for-me-copy/)
     * that may be admin duplicates. Excludes api, _next, and static files.
     */
    "/((?!api|_next|admin|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
