"use client";
import { useEffect, useRef } from "react";

/**
 * Preserves a signed-in user's in-progress work across the Stripe checkout
 * detour, the paid-plan counterpart to useToolDraftPersistence's guest/auth
 * detour handling.
 *
 * The billing gate that opens on a free-run-limit 403 (BillingGate.tsx,
 * mounted globally) has no idea which tool the user was on or what they had
 * typed — it just knows the popup needs to open. So each tool listens for
 * the same "billing:free-run-limit-exceeded" window event locally and stashes
 * its OWN current input the moment it fires. PricingPopup then sends the
 * user to Stripe with returnUrl set to the current page, and Stripe redirects
 * straight back here after payment — useToolDraftPersistence (already wired
 * in every tool that calls this) restores the same `tool_draft_<toolKey>` key
 * on remount, no separate restore path needed.
 *
 * Call this once per tool, right next to its existing
 * useToolDraftPersistence(toolKey, ...) call, passing a getDraft that
 * returns the same shape.
 */
export function useBillingDraftStash<T extends Record<string, unknown>>(
  toolKey: string,
  getDraft: () => T,
): void {
  const getDraftRef = useRef(getDraft);
  getDraftRef.current = getDraft;

  useEffect(() => {
    const storageKey = `tool_draft_${toolKey}`;
    const onLimitExceeded = () => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(getDraftRef.current()));
      } catch {
        // Storage full/unavailable — checkout still proceeds, just without restore.
      }
    };
    window.addEventListener("billing:free-run-limit-exceeded", onLimitExceeded);
    return () => window.removeEventListener("billing:free-run-limit-exceeded", onLimitExceeded);
  }, [toolKey]);
}
