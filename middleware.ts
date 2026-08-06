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

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
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
    if (!validSignature) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    return (
      payload?.role === "admin" &&
      payload?.iss === "scholarlyhelp-admin" &&
      payload?.aud === "scholarlyhelp-admin-panel" &&
      Number(payload?.exp) * 1000 > Date.now()
    );
  } catch {
    return false;
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
  const isAdminLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin/");
  if (isAdminPath && !isAdminLogin) {
    const valid = await verifyAdminSession(request.cookies.get("sh_admin_session")?.value);
    if (!valid) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
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
