"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_MESSAGE = "Page saved Successfully";
const AUTO_DISMISS_MS = 2600;

type AdminSuccessContextValue = {
  showSuccess: (message?: string) => void;
};

const AdminSuccessContext = createContext<AdminSuccessContextValue | null>(null);

export function AdminSuccessProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  }, []);

  const showSuccess = useCallback(
    (msg?: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg?.trim() || DEFAULT_MESSAGE);
      setOpen(true);
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <AdminSuccessContext.Provider value={{ showSuccess }}>
      {children}
      {open ? (
        <div
          className="admin-success-overlay fixed inset-0 z-[400] flex items-center justify-center bg-[#1a2456]/35 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={dismiss}
        >
          <div
            className="admin-success-card flex w-full max-w-[320px] flex-col items-center justify-center rounded-2xl border border-[#e2e8f4] bg-white px-10 py-10 text-center shadow-[0_24px_48px_rgba(26,36,86,0.18)]"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-success-check" aria-hidden>
              <svg className="block h-20 w-20" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" fill="#eef0ff" />
                <circle
                  className="admin-success-circle"
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#565add"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="admin-success-tick"
                  d="M26 41 L36 51 L54 31"
                  stroke="#565add"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <p className="mt-5 w-full text-center text-[15px] font-medium leading-snug tracking-wide text-[#1a2456]">
              {message}
            </p>
          </div>
        </div>
      ) : null}
    </AdminSuccessContext.Provider>
  );
}

export function useAdminSuccess(): AdminSuccessContextValue {
  const ctx = useContext(AdminSuccessContext);
  if (!ctx) {
    throw new Error("useAdminSuccess must be used within AdminSuccessProvider");
  }
  return ctx;
}
