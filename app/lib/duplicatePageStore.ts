import type { Db } from "mongodb";
import type { AdminPageRouteConfig } from "@/app/lib/adminPageRoutes";

export function buildSourceIdCandidates(
  route: AdminPageRouteConfig,
  explicitSourcePageId?: string | null,
): string[] {
  const ids: string[] = [];
  if (explicitSourcePageId?.trim()) ids.push(explicitSourcePageId.trim());
  if (route.defaultPageId) ids.push(route.defaultPageId);
  if (route.sourceDocumentIds) ids.push(...route.sourceDocumentIds);
  return [...new Set(ids.filter(Boolean))];
}

export async function findSourceDocument(
  db: Db,
  collection: string,
  sourceIds: string[],
) {
  const orConditions: Record<string, string>[] = [];
  for (const sourcePageId of sourceIds) {
    orConditions.push({ id: sourcePageId }, { pageType: sourcePageId }, { slug: sourcePageId });
    if (sourcePageId.startsWith("assignment_")) {
      orConditions.push({ slug: sourcePageId.replace("assignment_", "") });
    }
    if (sourcePageId.startsWith("exam_")) {
      orConditions.push({ slug: sourcePageId.replace("exam_", "") });
    }
    if (sourcePageId.startsWith("homework_")) {
      orConditions.push({ slug: sourcePageId.replace("homework_", "") });
    }
    if (sourcePageId.startsWith("essay_writing_")) {
      orConditions.push({ slug: sourcePageId.replace("essay_writing_", "") });
    }
    if (sourcePageId.startsWith("online_class_")) {
      orConditions.push({ slug: sourcePageId.replace("online_class_", "") });
    }
  }
  if (orConditions.length === 0) return null;
  return db.collection(collection).findOne({ $or: orConditions });
}

export async function findDuplicateDocument(db: Db, slug: string) {
  const legacyId = `landing-dup-${slug}`;
  return db.collection("pages").findOne({
    isDynamicLandingDuplicate: true,
    $or: [
      { id: slug },
      { pageType: slug },
      { dynamicLandingSlug: slug },
      { id: legacyId },
      { pageType: legacyId },
    ],
  });
}
