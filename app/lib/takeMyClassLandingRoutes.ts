/** Shared pathname helpers for take-my-class landing variants. */

export const TAKE_MY_CLASS_PROFESSOR_PATH = "/take-my-class-professor-does-not-care";
export const TAKE_MY_CLASS_STILL_DOING_PATH = "/take-my-class-still-doing";
export const TAKE_MY_CLASS_PATH = "/take-my-class";
export const TAKE_MY_CLASS_3_PATH = "/take-my-class-3";

const LANDING_PAGE_PATHS = [
  TAKE_MY_CLASS_PATH,
  TAKE_MY_CLASS_3_PATH,
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
] as const;

const EMAIL_ONLY_HERO_FORM_PATHS = [
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
] as const;

const HEADER_ROUTE_PATHS = [
  TAKE_MY_CLASS_PATH,
  "/take-my-class-2",
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
] as const;

export function normalizePathname(pathname: string | null | undefined): string {
  return (pathname || "").replace(/\/+$/, "") || "/";
}

/** take-my-class landing variants (shared section UX). */
export function isTakeMyClassLandingPage(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  if (path.startsWith("/landing/")) return true;
  return (LANDING_PAGE_PATHS as readonly string[]).includes(path);
}

/** Exact pathname match (with or without trailing slash). */
export function isTakeMyClassLandingPathname(pathname: string | null | undefined): boolean {
  const path = pathname || "";
  return (
    path === "/take-my-class/" ||
    path === "/take-my-class" ||
    path === "/take-my-class-3/" ||
    path === "/take-my-class-3" ||
    path === "/take-my-class-professor-does-not-care/" ||
    path === "/take-my-class-professor-does-not-care" ||
    path === "/take-my-class-still-doing/" ||
    path === "/take-my-class-still-doing"
  );
}

/** take-my-class-3 only (distinct centered header layout). */
export function isTakeMyClass3LandingPage(pathname: string | null | undefined): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_3_PATH;
}

/** Professor variant only. */
export function isTakeMyClassProfessorLandingPage(
  pathname: string | null | undefined,
): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_PROFESSOR_PATH;
}

/** Still-doing variant only. */
export function isTakeMyClassStillDoingLandingPage(
  pathname: string | null | undefined,
): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_STILL_DOING_PATH;
}

/** HeroForm2 email-only layout (professor + still-doing). */
export function isTakeMyClassEmailOnlyHeroFormPage(
  pathname: string | null | undefined,
): boolean {
  const path = normalizePathname(pathname);
  return (EMAIL_ONLY_HERO_FORM_PATHS as readonly string[]).includes(path);
}

/**
 * Header "special route" take-my-class group: original, variant 2, professor, still-doing.
 * Excludes take-my-class-3 (handled separately).
 */
export function isTakeMyClassHeaderRoute(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  return (HEADER_ROUTE_PATHS as readonly string[]).includes(path);
}

/** Legacy substring check used for hero button visibility, DeliveredOn, etc. */
export function pathnameIncludesTakeMyClass(pathname: string | null | undefined): boolean {
  const p = pathname || "";
  return p.includes("/take-my-class") || p.startsWith("/landing/");
}
