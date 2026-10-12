"use client";
import { hasRefreshSessionHint } from "@/app/lib/accessTokenStore";
import { startAiRun } from "@/app/lib/client/aiRun";

/**
 * Global click-based guest limit shared by ALL AI tools.
 *
 * A "click" is a user action that triggers an API call to the AI (Generate,
 * Paraphrase, Summarize, ask the tutor, generate a citation, etc.). Guests get
 * a small free allowance of such clicks; once exhausted, the next AI click opens
 * the sign-in / sign-up gate instead of calling the AI.
 *
 * The allowance is GLOBAL: a single lifetime counter shared across every tool
 * (1 click total anywhere; the 2nd anywhere gates). It is stored in
 * localStorage and never resets — an intentionally simple, client-only scheme.
 * This counter only decides when to show the gate up front. The server
 * enforces the real allowance (1 run per guest and per IP per day) and answers
 * GUEST_RUN_LIMIT_EXCEEDED, which calls markGuestClickLimitReached below.
 */

/** Free AI clicks a guest may perform across all tools before the gate. */
export const GUEST_CLICK_LIMIT = 1;

const CLICK_KEY = "guest_ai_click_count";

function readCount(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(key);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function writeCount(key: string, value: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, String(Math.max(0, value)));
}

/** A guest is any visitor without an auth token. */
export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  return !hasRefreshSessionHint();
}

/** How many AI clicks the current guest has already used. */
export function getGuestClickCount(): number {
  return readCount(CLICK_KEY);
}

/** True when a guest has already used all free clicks (gate the next one). */
export function hasReachedGuestClickLimit(): boolean {
  return isGuest() && getGuestClickCount() >= GUEST_CLICK_LIMIT;
}

/**
 * Attempt to consume one guest click BEFORE firing an AI request.
 *
 * Returns `true` if the caller may proceed (either the user is signed in, or a
 * free click was available and has now been counted). Returns `false` if the
 * guest allowance is exhausted — in that case the caller must open the auth
 * gate instead of calling the AI, and the counter is left untouched.
 *
 * Signed-in users always pass and are never counted. Every allowed click
 * starts a new AI run (see aiRun.ts) so the server charges it once.
 */
export function tryConsumeGuestClick(): boolean {
  if (isGuest()) {
    if (getGuestClickCount() >= GUEST_CLICK_LIMIT) return false;
    writeCount(CLICK_KEY, getGuestClickCount() + 1);
  }
  startAiRun();
  return true;
}

/** The server says this guest's allowance is used up; gate the next click locally too. */
export function markGuestClickLimitReached(): void {
  if (getGuestClickCount() < GUEST_CLICK_LIMIT) writeCount(CLICK_KEY, GUEST_CLICK_LIMIT);
}

/** Clear the guest click counter after a successful sign-up / login. */
export function clearGuestClickLimit(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLICK_KEY);
}
