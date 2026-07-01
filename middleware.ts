import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSinglePathSegment,
  isReservedTopLevelSegment,
} from "@/app/lib/staticPublicRoutes";

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
    /*
     * Single-segment public paths (e.g. /take-my-proctored-exam-for-me-copy/)
     * that may be admin duplicates. Excludes api, _next, and static files.
     */
    "/((?!api|_next|admin|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
