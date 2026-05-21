"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AdminDuplicateEditorContextValue = {
  duplicateSlug: string;
  duplicatedFromAdminPath: string;
};

const AdminDuplicateEditorContext = createContext<AdminDuplicateEditorContextValue | null>(
  null,
);

export function AdminDuplicateEditorProvider({
  duplicateSlug,
  duplicatedFromAdminPath,
  children,
}: {
  duplicateSlug: string;
  duplicatedFromAdminPath: string;
  children: ReactNode;
}) {
  return (
    <AdminDuplicateEditorContext.Provider
      value={{ duplicateSlug, duplicatedFromAdminPath }}
    >
      {children}
    </AdminDuplicateEditorContext.Provider>
  );
}

export function useAdminDuplicateEditorOptional() {
  return useContext(AdminDuplicateEditorContext);
}

/** Resolves GET/POST URL for a built-in page editor or its duplicate slug editor. */
export function useAdminPageApiUrl(standardApiPath: string): string {
  const dup = useAdminDuplicateEditorOptional();
  if (dup?.duplicateSlug) {
    return `/api/admin/duplicate-page/${encodeURIComponent(dup.duplicateSlug)}`;
  }
  return standardApiPath;
}
