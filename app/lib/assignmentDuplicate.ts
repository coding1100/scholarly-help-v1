import type { Db, Document } from "mongodb";
import { findDuplicateDocument } from "@/app/lib/duplicatePageStore";

function slugVariations(slug: string): string[] {
  const variations = [slug];
  if (slug.startsWith("assignment_")) {
    variations.push(slug.replace("assignment_", ""));
  } else {
    variations.push(`assignment_${slug}`);
  }
  return [...new Set(variations.filter(Boolean))];
}

function assignmentOrConditions(slug: string): Record<string, string>[] {
  const or: Record<string, string>[] = [];
  for (const variation of slugVariations(slug)) {
    or.push({ slug: variation }, { id: variation }, { pageType: variation });
    if (!variation.startsWith("assignment_")) {
      or.push(
        { id: `assignment_${variation}` },
        { pageType: `assignment_${variation}` },
      );
    }
  }
  return or;
}

function isAssignmentSource(doc: Record<string, unknown>): boolean {
  const from = String(doc.duplicatedFromAdminPath || doc.duplicatedFrom || "");
  return from.includes("/admin/assignment");
}

export async function findAssignmentSubjectDocument(
  db: Db,
  slug: string,
): Promise<Document | null> {
  const inAssignments = await db
    .collection("assignments")
    .findOne({ $or: assignmentOrConditions(slug) });
  if (inAssignments) return inAssignments;

  const dup = await findDuplicateDocument(db, slug);
  if (dup && isAssignmentSource(dup as Record<string, unknown>)) {
    return dup;
  }

  return null;
}

/** One-time style copy: assignment duplicates stored in `pages` → `assignments` */
export async function migratePagesDuplicateToAssignments(
  db: Db,
  slug: string,
): Promise<void> {
  const dup = await findDuplicateDocument(db, slug);
  if (!dup?.isDynamicLandingDuplicate) return;
  if (!isAssignmentSource(dup as Record<string, unknown>)) return;

  const existing = await db.collection("assignments").findOne({
    $or: assignmentOrConditions(slug),
  });
  if (existing) return;

  const normalizedSlug = slug.startsWith("assignment_")
    ? slug.replace("assignment_", "")
    : slug;
  const docId = slug.startsWith("assignment_") ? slug : `assignment_${slug}`;

  const { _id: _omit, ...rest } = dup as Document & { _id?: unknown };
  await db.collection("assignments").insertOne({
    ...rest,
    slug: normalizedSlug,
    id: docId,
    pageType: docId,
    migratedFromPagesCollection: true,
    updatedAt: new Date(),
  });
}
