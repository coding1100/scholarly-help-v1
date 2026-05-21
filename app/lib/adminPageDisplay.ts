/** Strip "Manage … Page Content" wrapper from an admin header or nav label */
export function shortNameFromAdminTitle(title: string): string {
  return title
    .trim()
    .replace(/^manage\s+/i, "")
    .replace(/\s+page\s+content(?:\s*\(copy\))?$/i, "")
    .trim();
}

const FULL_MANAGE_TITLE =
  /^manage\s+(.+?)\s+page\s+content(?:\s*\(copy\))?$/i;
const PAGE_CONTENT_LABEL = /^(.+?)\s+page\s+content(?:\s*\(copy\))?$/i;

/** Avoid "Manage Manage … Page Content Page Content" when label is already a full title */
export function buildAdminPageHeading(label: string): {
  title: string;
  subtitle: string;
  editingLabel: string;
} {
  const trimmed = label.trim();

  const manageMatch = trimmed.match(FULL_MANAGE_TITLE);
  if (manageMatch) {
    return {
      title: trimmed,
      subtitle: `Edit the ${manageMatch[1]} page content`,
      editingLabel: manageMatch[1],
    };
  }

  const pageContentMatch = trimmed.match(PAGE_CONTENT_LABEL);
  if (pageContentMatch) {
    return {
      title: trimmed,
      subtitle: `Edit the ${pageContentMatch[1]} page content`,
      editingLabel: trimmed,
    };
  }

  if (/\bpage\s+content\b/i.test(trimmed)) {
    const core = shortNameFromAdminTitle(trimmed) || trimmed;
    return {
      title: trimmed,
      subtitle: `Edit the ${core} page content`,
      editingLabel: trimmed,
    };
  }

  const core = trimmed;
  return {
    title: `Manage ${core} Page Content`,
    subtitle: `Edit the ${core} page content`,
    editingLabel: core,
  };
}

/** Duplicate editor: page title matches Admin / menu label exactly */
export function buildDuplicateAdminPageHeading(label: string): {
  title: string;
  subtitle: string;
  editingLabel: string;
} {
  const trimmed = label.trim() || "Duplicate page";
  return {
    title: trimmed,
    subtitle: `Edit the ${shortNameFromAdminTitle(trimmed) || trimmed} page content`,
    editingLabel: trimmed,
  };
}

/** Default menu label when duplicating from an admin page header title */
export function defaultDuplicateAdminNavLabel(sourceHeaderTitle: string): string {
  const core = shortNameFromAdminTitle(sourceHeaderTitle);
  return `${core} (copy)`;
}

/** Remove leading "Edit " for sidebar / header (e.g. "Edit Take My Class 2" → "Take My Class 2") */
export function stripEditNavPrefix(name: string): string {
  const trimmed = name.trim().replace(/^edit\s+/i, "").trim();
  return trimmed || name.trim();
}

/** @deprecated Prefer stripEditNavPrefix + core label; kept for duplicate modal defaults */
export function formatAdminEditTitle(coreLabel: string): string {
  const trimmed = coreLabel.trim();
  if (!trimmed) return "Page";
  return stripEditNavPrefix(trimmed);
}

/**
 * Title for admin top bar, page header, and sidebar.
 * Uses core page name immediately; custom DB label when set (duplicates keep full custom text).
 */
export function resolveAdminDisplayTitle(
  adminNavLabel: string | null | undefined,
  fallbackCore: string,
  options?: { isDuplicate?: boolean },
): string {
  const core = fallbackCore.trim();
  const custom = adminNavLabel?.trim();
  if (custom) {
    return options?.isDuplicate ? custom : stripEditNavPrefix(custom);
  }
  return core || "Page";
}
