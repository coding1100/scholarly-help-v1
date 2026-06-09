import { getPageData } from "@/app/lib/mongodb";
import {
  applyDuplicateLandingCanonical,
  dynamicLandingCanonicalUrl,
  dynamicLandingPublicPath,
  normalizePublicSlug,
} from "@/app/lib/dynamicLandingUrls";

export type DuplicateLandingLayout =
  | "take-my-class"
  | "take-my-exam"
  | "take-my-proctored-exam";

export {
  applyDuplicateLandingCanonical,
  dynamicLandingCanonicalUrl,
  dynamicLandingPublicPath,
  normalizePublicSlug,
};

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
