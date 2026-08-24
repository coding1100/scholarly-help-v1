/** Shared pathname helpers for take-my-class landing variants. */

export const TAKE_MY_CLASS_PROFESSOR_PATH = "/take-my-class-professor-does-not-care";
export const TAKE_MY_CLASS_STILL_DOING_PATH = "/take-my-class-still-doing";
export const TAKE_MY_CLASS_PROTECT_GPA_PATH = "/take-my-class-protect-gpa";
export const TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH =
  "/take-my-class-always-working-harder";
export const TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH =
  "/take-my-class-saving-your-future";
export const TAKE_MY_CLASS_PATH = "/take-my-class";
export const TAKE_MY_CLASS_3_PATH = "/take-my-class-3";
export const TAKE_MY_CLASS_4_PATH = "/take-my-class-4";
export const TAKE_MY_CLASS_5_PATH = "/take-my-class-5";
export const TAKE_MY_CLASS_6_PATH = "/take-my-class-6";

const LANDING_PAGE_PATHS = [
  TAKE_MY_CLASS_PATH,
  TAKE_MY_CLASS_3_PATH,
  TAKE_MY_CLASS_4_PATH,
  TAKE_MY_CLASS_5_PATH,
  TAKE_MY_CLASS_6_PATH,
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
  TAKE_MY_CLASS_PROTECT_GPA_PATH,
  TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
  TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
] as const;

const EMAIL_ONLY_HERO_FORM_PATHS = [
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
  TAKE_MY_CLASS_PROTECT_GPA_PATH,
  TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
  TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
] as const;

const HEADER_ROUTE_PATHS = [
  TAKE_MY_CLASS_PATH,
  "/take-my-class-2",
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
  TAKE_MY_CLASS_PROTECT_GPA_PATH,
  TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
  TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
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
    path === "/take-my-class-still-doing" ||
    path === "/take-my-class-protect-gpa/" ||
    path === "/take-my-class-protect-gpa" ||
    path === "/take-my-class-always-working-harder/" ||
    path === "/take-my-class-always-working-harder" ||
    path === "/take-my-class-saving-your-future/" ||
    path === "/take-my-class-saving-your-future"
  );
}

/** take-my-class-3 only (distinct centered header layout). */
export function isTakeMyClass3LandingPage(pathname: string | null | undefined): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_3_PATH;
}

/** take-my-class-4/5/6 (hero-copy-only duplicates of take-my-class-3). */
export function isTakeMyClassHeroCopyVariant(
  pathname: string | null | undefined,
): boolean {
  const path = normalizePathname(pathname);
  return (
    path === TAKE_MY_CLASS_4_PATH ||
    path === TAKE_MY_CLASS_5_PATH ||
    path === TAKE_MY_CLASS_6_PATH
  );
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

/** Protect-GPA variant only. */
export function isTakeMyClassProtectGpaLandingPage(
  pathname: string | null | undefined,
): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_PROTECT_GPA_PATH;
}

/** Always-working-harder variant only. */
export function isTakeMyClassAlwaysWorkingHarderLandingPage(
  pathname: string | null | undefined,
): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH;
}

/** Saving-your-future variant only. */
export function isTakeMyClassSavingYourFutureLandingPage(
  pathname: string | null | undefined,
): boolean {
  return normalizePathname(pathname) === TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH;
}

/** HeroForm2 email-only layout (professor + still-doing + protect-gpa + always-working-harder + saving-your-future). */
export function isTakeMyClassEmailOnlyHeroFormPage(
  pathname: string | null | undefined,
): boolean {
  const path = normalizePathname(pathname);
  return (EMAIL_ONLY_HERO_FORM_PATHS as readonly string[]).includes(path);
}

/**
 * Header "special route" take-my-class group: original, variant 2, professor, still-doing, protect-gpa, always-working-harder, saving-your-future.
 * Excludes take-my-class-3 (handled separately).
 */
export function isTakeMyClassHeaderRoute(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  return (HEADER_ROUTE_PATHS as readonly string[]).includes(path);
}

/** Pages that render HeroForm2 (distinct default CTA casing). */
export function usesHeroForm2Layout(
  pathname: string | null | undefined,
): boolean {
  const path = normalizePathname(pathname);
  if (
    path === TAKE_MY_CLASS_PATH ||
    path === TAKE_MY_CLASS_3_PATH ||
    path === TAKE_MY_CLASS_4_PATH ||
    path === TAKE_MY_CLASS_5_PATH ||
    path === TAKE_MY_CLASS_6_PATH
  )
    return true;
  return isTakeMyClassEmailOnlyHeroFormPage(pathname);
}

/** Hero form submit / sticky CTA label for the current landing path. */
export function getLandingHeroFormCtaText(
  pathname: string | null | undefined,
  getQuoteCtaText?: string | null,
): string {
  if (isTakeMyClassEmailOnlyHeroFormPage(pathname)) {
    return "Get My Academic Plan Now";
  }
  const custom = getQuoteCtaText?.trim();
  if (custom) return custom;
  return usesHeroForm2Layout(pathname)
    ? "SECURE MY 'A' OR 'B' GRADES"
    : "Secure My 'A' or 'B' Grades";
}

/** Legacy substring check used for hero button visibility, DeliveredOn, etc. */
export function pathnameIncludesTakeMyClass(pathname: string | null | undefined): boolean {
  const p = pathname || "";
  return p.includes("/take-my-class") || p.startsWith("/landing/");
}
