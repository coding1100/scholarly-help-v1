"use client";

import { useCallback, useState } from "react";
import {
  hasReachedGuestClickLimit,
  isGuest,
  tryConsumeGuestClick,
} from "@/app/lib/client/guestClickLimits";

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
 */
export function useGuestGate() {
  const [gateOpen, setGateOpen] = useState(false);

  const closeGate = useCallback(() => setGateOpen(false), []);
  const openGate = useCallback(() => setGateOpen(true), []);

  /**
   * Gate an AI-triggering action. Returns true if the action was allowed to run
   * (a click was consumed or the user is signed in), false if it was blocked
   * and the gate was opened instead.
   */
  const guardAiClick = useCallback(
    (run: () => void | Promise<void>): boolean => {
      if (!tryConsumeGuestClick()) {
        setGateOpen(true);
        return false;
      }
      void run();
      return true;
    },
    [],
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
      setGateOpen(true);
      return false;
    }
    return true;
  }, []);

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
