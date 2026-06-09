"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminPageTitleContextValue = {
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
};

const AdminPageTitleContext = createContext<AdminPageTitleContextValue | null>(null);

export function AdminPageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitleState] = useState<string | null>(null);

  const setPageTitle = useCallback((title: string | null) => {
    setPageTitleState(title?.trim() ? title.trim() : null);
  }, []);

  const value = useMemo(
    () => ({ pageTitle, setPageTitle }),
    [pageTitle, setPageTitle],
  );

  return (
    <AdminPageTitleContext.Provider value={value}>{children}</AdminPageTitleContext.Provider>
  );
}

export function useAdminPageTitle() {
  const ctx = useContext(AdminPageTitleContext);
  if (!ctx) {
    throw new Error("useAdminPageTitle must be used within AdminPageTitleProvider");
  }
  return ctx;
}

/** Safe hook for layout — returns null setter when provider missing */
export function useAdminPageTitleOptional() {
  return useContext(AdminPageTitleContext);
}
