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
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/tools/") &&
    pathname !== "/tools" &&
    pathname !== "/tools/"
  ) {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      request.nextUrl.searchParams.forEach((value, key) => {
        signInUrl.searchParams.set(key, value);
      });
      const returnUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      signInUrl.searchParams.set("returnUrl", returnUrl);
      return NextResponse.redirect(signInUrl);
    }
  }

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
