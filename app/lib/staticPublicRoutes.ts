/**
 * First URL segments that already have a static page under app/(pages)/{segment}/.
 * Used by middleware so admin duplicates at /{slug}/ can rewrite to /landing/{slug}/
 * without adding a conflicting (pages)/[slug] route next to (pages)/[category]/[slug].
 */
export const STATIC_TOP_LEVEL_SEGMENTS = new Set([
  "about-us",
  "a-or-b-grade-guarantee",
  "academic-research",
  "assignment",
  "class-help",
  "classhelpdiscount",
  "contact-us",
  "dissertation-writing-services",
  "do-my-aleks-for-me",
  "do-my-assignment",
  "do-my-class",
  "do-my-class-1",
  "do-my-class-2",
  "do-my-exam",
  "essay-writing",
  "exam",
  "exams",
  "forgot-password",
  "guarantee-anonymity",
  "help-me-with-my-exam",
  "homework",
  "landing",
  "on-time-delivery-guarantee",
  "online-class",
  "order",
  "otp",
  "pay-for-someone-to-write-my-paper",
  "pay-someone-to-do-my-assignment",
  "pay-someone-to-do-my-edgenuity",
  "pay-someone-to-take-my-online-exam",
  "plagiarism-free-process",
  "pricing",
  "privacy",
  "math-solver",
  "research-question",
  "reset-password",
  "samples",
  "savemytime",
  "scan",
  "sign-in",
  "sign-up",
  "success-stories-and-reviews",
  "take-my-class",
  "take-my-class-1",
  "take-my-class-2",
  "take-my-class-3",
  "take-my-class-4",
  "take-my-class-5",
  "take-my-class-6",
  "take-my-class-professor-does-not-care",
  "take-my-class-still-doing",
  "take-my-class-protect-gpa",
  "take-my-class-always-working-harder",
  "take-my-class-saving-your-future",
  "take-my-exam",
  "take-my-proctored-exam-for-me",
  "take-my-teas-exam",
  "take-my-hesi-exam",
  "terms-and-conditions",
  "thank-you",
  "thank-you-2",
  "thank-you-3",
  "tools",
  "us-based-phd-experts",
  "write-my-paper",
  "cgpa-calculator",
  "admin",
  "api",
  "_next",
]);

export function getSinglePathSegment(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length !== 1) return null;
  return decodeURIComponent(parts[0]).toLowerCase();
}

export function isReservedTopLevelSegment(segment: string): boolean {
  return STATIC_TOP_LEVEL_SEGMENTS.has(segment.toLowerCase());
}
