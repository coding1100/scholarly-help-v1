"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import SignUpCard from "@/app/components/Auth/SignUpCard";
import SignInCard from "@/app/components/Auth/SignInCard";
import { stashGuestMigrationId } from "@/app/lib/client/guestStudyLimits";

type GuestAuthGateModalProps = {
  open: boolean;
  /** Where to return after auth completes (defaults to the current URL). */
  returnUrl?: string;
  /** Optional custom heading for the sign-up call to action. */
  heading?: string;
  onClose: () => void;
};

type AuthMode = "signup" | "signin";

const DEFAULT_SIGNUP_HEADING =
  "You've used your free actions. Create a free account to keep going.";
const SIGNIN_HEADING = "Sign in to keep going.";

/**
 * Global email/password gate shown to guests once they exhaust their free
 * click allowance on ANY tool. Reuses the platform's standard sign-up and
 * sign-in forms (including the Google button). Both flows carry a returnUrl so
 * the user lands back on the tool they were using; the guest id is stashed
 * first so any Study Workspace work migrates onto the new account.
 */
const GuestAuthGateModal: FC<GuestAuthGateModalProps> = ({
  open,
  returnUrl,
  heading,
  onClose,
}) => {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [resolvedReturnUrl, setResolvedReturnUrl] = useState<string>("/tools");

  useEffect(() => {
    if (!open) return;
    setMode("signup");
    // Default the return target to wherever the user currently is.
    if (typeof window !== "undefined") {
      setResolvedReturnUrl(
        returnUrl || `${window.location.pathname}${window.location.search}`,
      );
    }
    // Remember which guest's work to migrate once they come back signed in.
    stashGuestMigrationId();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, returnUrl]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#2B1C50]">
            {mode === "signin" ? SIGNIN_HEADING : heading || DEFAULT_SIGNUP_HEADING}
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
          >
            <MdClose size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Your current work is saved and will move to your new account.
        </p>

        {mode === "signin" ? (
          <SignInCard
            switchAuthForm="signin"
            setSwitchAuthForm={setMode}
            returnUrl={resolvedReturnUrl}
          />
        ) : (
          <SignUpCard
            switchAuthForm="signup"
            setSwitchAuthForm={setMode}
            returnUrl={resolvedReturnUrl}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

export default GuestAuthGateModal;
