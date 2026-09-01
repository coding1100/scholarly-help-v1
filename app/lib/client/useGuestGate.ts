"use client";

import { useCallback, useRef, useState } from "react";
import {
  hasReachedGuestClickLimit,
  isGuest,
  tryConsumeGuestClick,
} from "@/app/lib/client/guestClickLimits";

type UseGuestGateOptions<T extends Record<string, unknown>> = {
  /**
   * Called right before the auth gate opens, so the caller's current input
   * (and anything else worth keeping) can be captured and restored after
   * sign-in/sign-up via useToolDraftPersistence with the same toolKey.
   */
  getDraft?: () => T;
  stashDraft?: (draft: T) => void;
};

/**
 * Shared hook that enforces the global guest click limit for a tool.
 *
 * Usage in any tool component:
 *
 *   const { gateOpen, closeGate, guardAiClick } = useGuestGate();
 *   ...
 *   <button onClick={() => guardAiClick(() => runGeneration())}>Generate</button>
 *   ...
 *   <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
 *
 * `guardAiClick(run)` consumes one free guest click and invokes `run()`. If the
 * guest has already used their allowance, it opens the auth gate instead and
 * does NOT invoke `run()`. Signed-in users always pass straight through.
 *
 * Pass `getDraft`/`stashDraft` (from useToolDraftPersistence) to automatically
 * snapshot the tool's current input whenever the gate opens, so it can be
 * restored when the user lands back on this tool after auth.
 */
export function useGuestGate<T extends Record<string, unknown> = Record<string, unknown>>(
  options?: UseGuestGateOptions<T>,
) {
  const [gateOpen, setGateOpen] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const closeGate = useCallback(() => setGateOpen(false), []);
  const openGate = useCallback(() => {
    const { getDraft, stashDraft } = optionsRef.current || {};
    if (getDraft && stashDraft) stashDraft(getDraft());
    setGateOpen(true);
  }, []);

  /**
   * Gate an AI-triggering action. Returns true if the action was allowed to run
   * (a click was consumed or the user is signed in), false if it was blocked
   * and the gate was opened instead.
   */
  const guardAiClick = useCallback(
    (run: () => void | Promise<void>): boolean => {
      if (!tryConsumeGuestClick()) {
        openGate();
        return false;
      }
      void run();
      return true;
    },
    [openGate],
  );

  /**
   * Imperative variant for AI actions buried inside deeper async flows (e.g. a
   * rich-text editor) where wrapping the call in a callback is awkward. Consumes
   * one guest click and returns true if the caller may proceed; returns false
   * and opens the gate when the allowance is exhausted. Signed-in users always
   * return true.
   */
  const ensureGuestClick = useCallback((): boolean => {
    if (!tryConsumeGuestClick()) {
      openGate();
      return false;
    }
    return true;
  }, [openGate]);

  /**
   * Non-consuming check for AUTOMATIC (non-click) AI features such as inline
   * autocomplete. These shouldn't spend a click per keystroke, but a guest who
   * has already used their allowance should stop receiving free AI. Returns true
   * when the automatic feature must be suppressed (guest with no allowance
   * left). Does NOT open the gate — automatic features fail silently.
   */
  const isGuestOutOfAllowance = useCallback((): boolean => {
    return isGuest() && hasReachedGuestClickLimit();
  }, []);

  return {
    gateOpen,
    openGate,
    closeGate,
    guardAiClick,
    ensureGuestClick,
    isGuestOutOfAllowance,
    hasReachedLimit: hasReachedGuestClickLimit,
  };
}
