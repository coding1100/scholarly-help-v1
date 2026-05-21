/**
 * Normalizes pathname for matching (handles `trailingSlash: true`, stray slashes, base path).
 */
export function adminPathKey(pathname: string | null | undefined): string {
  let raw = (pathname || "").trim();
  raw = raw.replace(/\/+/g, "/");
  raw = raw.replace(/\/+$/, "") || "/";
  const adminMark = "/admin/";
  const i = raw.indexOf(adminMark);
  if (i >= 0) {
    return raw.slice(i);
  }
  return raw;
}

/**
 * True when this sidebar link matches the current admin route (trailing slash safe).
 * Dashboard `/admin` matches only exactly, not `/admin/home`.
 */
export function isAdminNavLinkActive(
  pathname: string | null | undefined,
  href: string,
): boolean {
  const current = adminPathKey(pathname);
  const target = adminPathKey(href);
  if (!target) return false;
  if (target === "/admin") {
    return current === "/admin";
  }
  return current === target || current.startsWith(`${target}/`);
}

export function adminNavLinkClass(active: boolean): string {
  return active ? "admin-nav-link admin-nav-link-active" : "admin-nav-link";
}
