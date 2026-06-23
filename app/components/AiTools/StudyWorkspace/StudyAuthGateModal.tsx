"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import SignUpCard from "@/app/components/Auth/SignUpCard";
import SignInCard from "@/app/components/Auth/SignInCard";
import { stashGuestMigrationId } from "@/app/lib/client/guestStudyLimits";

type StudyAuthGateModalProps = {
  open: boolean;
  /** "query" => hit the 3-question limit; "session" => 2nd session. */
  reason: "query" | "session";
  /** Where to return after auth completes (the current session URL). */
  returnUrl: string;
  onClose: () => void;
};

type AuthMode = "signup" | "signin";

const HEADINGS: Record<StudyAuthGateModalProps["reason"], string> = {
  query:
    "You've used your 3 free questions. Create a free account to keep going.",
  session:
    "Create a free account to start another study session.",
};

const SIGNIN_HEADING = "Sign in to keep your study work.";

/**
 * Email-gate shown to guests on the AI Study Workspace. Reuses the platform's
 * standard sign-up form (email + password → email verification) and the same
 * Google button used on the login/sign-up page. Both flows carry a returnUrl
 * back to the user's current session so they land right where they left off;
 * the guest id is stashed first so their work migrates onto the new account.
 */
const StudyAuthGateModal: FC<StudyAuthGateModalProps> = ({
  open,
  reason,
  returnUrl,
  onClose,
}) => {
  // The modal swaps between the sign-up and sign-in forms in place — pressing
  // "Sign in Here" / "Sign up Here" toggles this rather than navigating away.
  const [mode, setMode] = useState<AuthMode>("signup");

  useEffect(() => {
    if (!open) return;
    // Always open on the sign-up form (the gate's default call to action).
    setMode("signup");
    // Remember which guest's work to migrate once they come back signed in.
    stashGuestMigrationId();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
            {mode === "signin" ? SIGNIN_HEADING : HEADINGS[reason]}
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
            returnUrl={returnUrl}
          />
        ) : (
          <SignUpCard
            switchAuthForm="signup"
            setSwitchAuthForm={setMode}
            returnUrl={returnUrl}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

export default StudyAuthGateModal;
