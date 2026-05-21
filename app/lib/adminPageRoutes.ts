import { adminPathKey } from "@/app/lib/adminPathUtils";

export type AdminNavParent = "main" | "pages";

export type AdminPageRouteConfig = {
  /** Normalized admin path, e.g. `/admin/home` */
  adminPath: string;
  parentNav: AdminNavParent;
  /** Mongo collection for source document */
  collection: string;
  /** Default document id when not multi-page */
  defaultPageId: string | null;
  /** Extra Mongo ids to try when loading source (e.g. tools → academic-tools) */
  sourceDocumentIds?: string[];
  multiPage: boolean;
  /** Label shown in duplicate modal */
  parentLabel: string;
};

export const ADMIN_PAGE_ROUTES: AdminPageRouteConfig[] = [
  { adminPath: "/admin/home", parentNav: "main", collection: "home", defaultPageId: "home_page", multiPage: false, parentLabel: "Main — Edit Home" },
  { adminPath: "/admin/assignment", parentNav: "main", collection: "assignments", defaultPageId: "assignment_page", multiPage: true, parentLabel: "Main — Edit Assignment" },
  { adminPath: "/admin/exam", parentNav: "main", collection: "exam", defaultPageId: "exam_page", multiPage: true, parentLabel: "Main — Edit Exam" },
  { adminPath: "/admin/homework", parentNav: "main", collection: "homework", defaultPageId: "homework_page", multiPage: true, parentLabel: "Main — Edit Homework" },
  { adminPath: "/admin/online-class", parentNav: "main", collection: "online_classes", defaultPageId: "online_class_page", multiPage: true, parentLabel: "Main — Edit Online Class" },
  { adminPath: "/admin/essay-writing", parentNav: "main", collection: "essay_writing", defaultPageId: "essay_writing_page", multiPage: true, parentLabel: "Main — Edit Essay Writing" },
  { adminPath: "/admin/pages", parentNav: "pages", collection: "pages", defaultPageId: null, multiPage: false, parentLabel: "Pages — Manage Pages" },
  { adminPath: "/admin/a-or-b-grade-guarantee", parentNav: "pages", collection: "pages", defaultPageId: "a-or-b-grade-guarantee", multiPage: false, parentLabel: "Pages — A/B Grade Guarantee" },
  {
    adminPath: "/admin/tools",
    parentNav: "pages",
    collection: "pages",
    defaultPageId: "academic-tools",
    sourceDocumentIds: ["academic-tools", "tools"],
    multiPage: false,
    parentLabel: "Pages — Academic Tools",
  },
  { adminPath: "/admin/guarantee-anonymity", parentNav: "pages", collection: "pages", defaultPageId: "guarantee-anonymity", multiPage: false, parentLabel: "Pages — Guarantee Anonymity" },
  { adminPath: "/admin/us-based-phd-experts", parentNav: "pages", collection: "pages", defaultPageId: "us-based-phd-experts", multiPage: false, parentLabel: "Pages — US PhD Experts" },
  { adminPath: "/admin/success-stories-and-reviews", parentNav: "pages", collection: "pages", defaultPageId: "success-stories-and-reviews", multiPage: false, parentLabel: "Pages — Success Stories" },
  { adminPath: "/admin/plagiarism-free-process", parentNav: "pages", collection: "pages", defaultPageId: "plagiarism-free-process", multiPage: false, parentLabel: "Pages — Plagiarism-Free Process" },
  { adminPath: "/admin/on-time-delivery-guarantee", parentNav: "pages", collection: "pages", defaultPageId: "on-time-delivery-guarantee", multiPage: false, parentLabel: "Pages — On-Time Delivery" },
  { adminPath: "/admin/take-my-class-still-doing", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-still-doing", multiPage: false, parentLabel: "Pages — Take My Class (Still Doing)" },
  { adminPath: "/admin/take-my-class-professor-does-not-care", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-professor-does-not-care", multiPage: false, parentLabel: "Pages — Take My Class (Professor)" },
  { adminPath: "/admin/take-my-class-protect-gpa", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-protect-gpa", multiPage: false, parentLabel: "Pages — Take My Class (Protect GPA)" },
  { adminPath: "/admin/take-my-class-always-working-harder", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-always-working-harder", multiPage: false, parentLabel: "Pages — Take My Class (Always Working Harder)" },
  { adminPath: "/admin/take-my-class-saving-your-future", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-saving-your-future", multiPage: false, parentLabel: "Pages — Take My Class (Saving Your Future)" },
  { adminPath: "/admin/take-my-class-3", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-3", multiPage: false, parentLabel: "Pages — Take My Class 3" },
  { adminPath: "/admin/take-my-class-2", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-2", multiPage: false, parentLabel: "Pages — Take My Class 2" },
  { adminPath: "/admin/take-my-class-1", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class-1", multiPage: false, parentLabel: "Pages — Take My Class 1" },
  { adminPath: "/admin/take-my-class", parentNav: "pages", collection: "pages", defaultPageId: "take-my-class", multiPage: false, parentLabel: "Pages — Take My Class" },
  { adminPath: "/admin/take-my-exam", parentNav: "pages", collection: "pages", defaultPageId: "take-my-exam", multiPage: false, parentLabel: "Pages — Take My Exam" },
  { adminPath: "/admin/take-my-proctored-exam-for-me", parentNav: "pages", collection: "pages", defaultPageId: "take-my-proctored-exam-for-me", multiPage: false, parentLabel: "Pages — Proctored Exam" },
  { adminPath: "/admin/faq", parentNav: "pages", collection: "pages", defaultPageId: "faq", multiPage: false, parentLabel: "Pages — FAQ" },
];

const SORTED_ROUTES = [...ADMIN_PAGE_ROUTES].sort(
  (a, b) => b.adminPath.length - a.adminPath.length,
);

export function getAdminPageRouteConfig(
  pathname: string | null | undefined,
): AdminPageRouteConfig | null {
  const p = adminPathKey(pathname);
  const dupMatch = p.match(/^\/admin\/([^/]+)$/);
  if (dupMatch) {
    const slug = decodeURIComponent(dupMatch[1]);
    const isBuiltIn = ADMIN_PAGE_ROUTES.some((r) => r.adminPath === `/admin/${slug}`);
    if (!isBuiltIn && slug !== "login" && slug !== "pages" && slug !== "landing") {
      return {
        adminPath: p,
        parentNav: "pages",
        collection: "pages",
        defaultPageId: null,
        multiPage: false,
        parentLabel: "Pages — Duplicated page",
      };
    }
  }
  for (const route of SORTED_ROUTES) {
    if (p === route.adminPath) return route;
  }
  return null;
}

export function resolveSourcePageId(
  route: AdminPageRouteConfig,
  sourcePageId?: string | null,
): string | null {
  if (sourcePageId?.trim()) return sourcePageId.trim();
  if (route.defaultPageId) return route.defaultPageId;
  const m = route.adminPath.match(/^\/admin\/([^/]+)$/);
  if (m) return decodeURIComponent(m[1]);
  return null;
}

/** Pages submenu editor (not main menu, not the pages list) */
export function isPagesMenuEditor(
  route: AdminPageRouteConfig | null | undefined,
): boolean {
  if (!route) return false;
  return route.parentNav === "pages" && route.adminPath !== "/admin/pages";
}

/** Mongo / API id used for adminNavLabel on this editor */
export function getAdminPageNavId(
  route: AdminPageRouteConfig | null | undefined,
): string | null {
  if (!route || !isPagesMenuEditor(route)) return null;
  return resolveSourcePageId(route, null);
}

export function isAdminDuplicateRoute(
  route: AdminPageRouteConfig | null | undefined,
): boolean {
  if (!route || !isPagesMenuEditor(route)) return false;
  return route.defaultPageId == null;
}

/** Core name for default title, e.g. "Take My Class 3" */
export function coreLabelFromAdminRoute(route: AdminPageRouteConfig): string {
  return route.parentLabel.replace(/^Pages\s*—\s*/i, "").trim();
}

/** Duplicate + edit icons on every Pages menu editor */
export function canDuplicateAdminPage(
  route: AdminPageRouteConfig | null | undefined,
): boolean {
  if (!isPagesMenuEditor(route)) return false;
  return resolveSourcePageId(route!, null) != null;
}
