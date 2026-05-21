/** Client-safe URL helpers for dynamic landing duplicates (no MongoDB). */

export function normalizePublicSlug(raw: string): string {
  return decodeURIComponent(raw || "").replace(/^\/+|\/+$/g, "");
}

export function dynamicLandingPublicPath(slug: string): string {
  return `/${encodeURIComponent(normalizePublicSlug(slug))}/`;
}

export function getSiteBaseUrl(): string {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
}

export function dynamicLandingCanonicalUrl(
  slug: string,
  pageData?: { meta?: { canonicalUrl?: string } } | null,
): string {
  return (
    pageData?.meta?.canonicalUrl ||
    `${getSiteBaseUrl()}${dynamicLandingPublicPath(slug)}`
  );
}

/** Force canonical URL to match the duplicate's public slug (used on create/save). */
export function applyDuplicateLandingCanonical(
  slug: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizePublicSlug(slug);
  if (!normalized) return data;

  const meta =
    data.meta && typeof data.meta === "object" && !Array.isArray(data.meta)
      ? { ...(data.meta as Record<string, unknown>) }
      : {};

  return {
    ...data,
    meta: {
      ...meta,
      canonicalUrl: dynamicLandingCanonicalUrl(normalized, null),
    },
  };
}
