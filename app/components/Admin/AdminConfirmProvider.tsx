"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AdminButton from "@/app/components/Admin/AdminButton";

export type AdminConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "delete" | "remove";
};

type AdminConfirmContextValue = {
  confirmDelete: (options: string | AdminConfirmOptions) => Promise<boolean>;
};

const AdminConfirmContext = createContext<AdminConfirmContextValue | null>(null);

const DEFAULTS: Record<string, AdminConfirmOptions> = {
  delete: {
    title: "Confirm delete",
    message: "Are you sure you want to delete this? This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    variant: "delete",
  },
  remove: {
    title: "Confirm remove",
    message: "Are you sure you want to remove this item?",
    confirmLabel: "Remove",
    cancelLabel: "Cancel",
    variant: "remove",
  },
};

function normalizeOptions(input: string | AdminConfirmOptions): AdminConfirmOptions {
  if (typeof input === "string") {
    return { ...DEFAULTS.delete, message: input };
  }
  const variant = input.variant === "remove" ? "remove" : "delete";
  return { ...DEFAULTS[variant], ...input };
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<AdminConfirmOptions>(DEFAULTS.delete);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirmDelete = useCallback((input: string | AdminConfirmOptions) => {
    const opts = normalizeOptions(input);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOpen(false);
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(result);
  }, []);

  return (
    <AdminConfirmContext.Provider value={{ confirmDelete }}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-confirm-title" className="text-lg font-semibold text-gray-900">
              {options.title}
            </h2>
            <p id="admin-confirm-desc" className="mt-3 text-sm text-gray-600">
              {options.message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton type="button" variant="cancel" onClick={() => close(false)}>
                {options.cancelLabel ?? "Cancel"}
              </AdminButton>
              <AdminButton type="button" variant="danger" onClick={() => close(true)}>
                {options.confirmLabel ?? "Delete"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </AdminConfirmContext.Provider>
  );
}

export function useAdminConfirm(): AdminConfirmContextValue {
  const ctx = useContext(AdminConfirmContext);
  if (!ctx) {
    throw new Error("useAdminConfirm must be used within AdminConfirmProvider");
  }
  return ctx;
}
