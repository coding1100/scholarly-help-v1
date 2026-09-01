"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Preserves a guest's in-progress work across the sign-in / sign-up detour.
 *
 * Tool components call `stashDraft()` right before opening the auth gate
 * (i.e. inside the same branch that would otherwise block the AI call), then
 * `useToolDraftPersistence` restores it once on mount when the tool page is
 * revisited after auth — `GuestAuthGateModal` already sends the user back to
 * `returnUrl`, which is this same tool page, so a normal client navigation
 * (not a full reload) is all that's needed for restore to fire on remount.
 *
 * Scoped per tool via `toolKey` so drafts from different tools never collide.
 * Stored in localStorage (not sessionStorage) because auth can happen via a
 * redirect-based provider (e.g. Google) that leaves the original tab's
 * sessionStorage behind. The draft is a best-effort UX nicety, not
 * durable state — it never blocks the tool if reading/writing fails (private
 * browsing, storage disabled, etc.), and is deleted immediately after restore
 * so stale drafts don't reappear on an unrelated later visit.
 */
export function useToolDraftPersistence<T extends Record<string, unknown>>(
  toolKey: string,
  onRestore: (draft: T) => void,
) {
  const storageKey = `tool_draft_${toolKey}`;
  const restoredRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      window.localStorage.removeItem(storageKey);
      const draft = JSON.parse(raw) as T;
      onRestoreRef.current(draft);
    } catch {
      // Corrupt or inaccessible storage — silently skip restore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const stashDraft = useCallback(
    (draft: T) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Storage full/unavailable — the auth gate still works, just without restore.
      }
    },
    [storageKey],
  );

  return { stashDraft };
}
