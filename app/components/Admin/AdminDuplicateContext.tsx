"use client";

import { createContext, useContext, type ReactNode } from "react";

type AdminDuplicateContextValue = {
  /** Mongo document id for multi-page editors (assignment, exam, etc.) */
  sourcePageId?: string;
};

const AdminDuplicateContext = createContext<AdminDuplicateContextValue>({});

export function AdminDuplicateProvider({
  sourcePageId,
  children,
}: {
  sourcePageId?: string;
  children: ReactNode;
}) {
  return (
    <AdminDuplicateContext.Provider value={{ sourcePageId }}>
      {children}
    </AdminDuplicateContext.Provider>
  );
}

export function useAdminDuplicateSourcePageId() {
  return useContext(AdminDuplicateContext).sourcePageId;
}
