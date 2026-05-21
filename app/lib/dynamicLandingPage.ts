import { getPageData } from "@/app/lib/mongodb";

export type DuplicateLandingLayout =
  | "take-my-class"
  | "take-my-exam"
  | "take-my-proctored-exam";

export function normalizePublicSlug(raw: string): string {
  return decodeURIComponent(raw || "").replace(/^\/+|\/+$/g, "");
}

export function dynamicLandingPublicPath(slug: string): string {
  return `/${encodeURIComponent(normalizePublicSlug(slug))}/`;
}

/** Fetch a published admin duplicate for the public site */
export async function fetchPublishedDynamicLanding(slug: string) {
  const normalized = normalizePublicSlug(slug);
  if (!normalized) return null;

  try {
    const query = {
      isDynamicLandingDuplicate: true,
      published: true,
      $or: [
        { dynamicLandingSlug: normalized },
        { id: normalized },
        { slug: normalized },
        { pageType: normalized },
        { id: `landing-dup-${normalized}` },
      ],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching published dynamic landing:", error);
    return null;
  }
}

export function resolveDuplicateLandingLayout(
  pageData: Record<string, unknown> | null | undefined,
): DuplicateLandingLayout {
  const path = String(pageData?.duplicatedFromAdminPath || "");
  const from = String(pageData?.duplicatedFrom || "");
  if (path.includes("take-my-proctored") || from.includes("take-my-proctored")) {
    return "take-my-proctored-exam";
  }
  if (path.includes("take-my-exam") || from.includes("take-my-exam")) {
    return "take-my-exam";
  }
  return "take-my-class";
}

export function dynamicLandingCanonicalUrl(
  slug: string,
  pageData?: { meta?: { canonicalUrl?: string } } | null,
): string {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  return (
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}${dynamicLandingPublicPath(slug)}`
  );
}
