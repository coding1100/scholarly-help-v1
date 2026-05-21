import { ADMIN_PAGE_ROUTES } from "@/app/lib/adminPageRoutes";
import { adminPathKey } from "@/app/lib/adminPathUtils";

export { adminPathKey } from "@/app/lib/adminPathUtils";

/** Built-in admin routes — not treated as dynamic duplicates */
export const STATIC_ADMIN_SLUGS = new Set([
  "login",
  "pages",
  "landing",
  "dup",
  ...ADMIN_PAGE_ROUTES.map((r) => r.adminPath.replace(/^\/admin\//, "")),
]);

/**
 * `/admin/tools-test` when `tools-test` is not a built-in admin route.
 */
export function parseDuplicateAdminSlug(pathname: string | null | undefined): string | null {
  const p = adminPathKey(pathname);
  const m = p.match(/^\/admin\/([^/]+)$/);
  if (!m) return null;
  const slug = decodeURIComponent(m[1]);
  if (STATIC_ADMIN_SLUGS.has(slug)) return null;
  return slug;
}

export function isAdminDynamicLandingEditorPath(pathname: string | null | undefined): boolean {
  return !!parseDuplicateAdminSlug(pathname);
}

/** @deprecated use parseDuplicateAdminSlug */
export function parseAdminLandingPageId(pathname: string | null | undefined): string | null {
  const p = adminPathKey(pathname);
  const legacy = p.match(/^\/admin\/landing\/([^/]+)$/);
  if (legacy) {
    const id = decodeURIComponent(legacy[1]);
    if (id.startsWith("landing-dup-")) {
      return id.replace(/^landing-dup-/, "");
    }
    return id;
  }
  return parseDuplicateAdminSlug(pathname);
}

/**
 * Maps an admin URL to the Mongo `pages` document id used as the duplicate source.
 */
export function getTakeMyClassDuplicateSourcePageId(
  pathname: string | null | undefined,
): string | null {
  const p = adminPathKey(pathname);
  if (!p.startsWith("/admin/")) return null;

  if (p.includes("take-my-class-still-doing")) return "take-my-class-still-doing";
  if (p.includes("take-my-class-professor-does-not-care")) {
    return "take-my-class-professor-does-not-care";
  }
  if (p.includes("take-my-class-3")) return "take-my-class-3";
  if (p.includes("take-my-class-2")) return "take-my-class-2";
  if (p.includes("take-my-class-1")) return "take-my-class-1";
  if (p === "/admin/take-my-class") return "take-my-class";
  return null;
}
