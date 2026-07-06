"use client";

/**
 * Client-side guest bookkeeping for the AI Study Workspace.
 *
 * The FREE-USAGE gate is enforced elsewhere: `guestClickLimits.ts` holds a
 * single global "AI click" counter (Generate / Regenerate / tutor query, etc.)
 * shared across all tools. This module only tracks study-session counts (for
 * analytics/migration) and the guest→account migration handshake. It does NOT
 * gate tutor queries — an earlier per-query counter here was never wired up, so
 * it has been removed to avoid implying a second, competing limit.
 *
 * Counts are LIFETIME (never reset) and stored in localStorage — an
 * intentionally temporary, client-only scheme that does not survive clearing
 * storage / incognito. Swap the bodies for server-backed counters if this ever
 * needs to be tamper-proof; the rest of the app only depends on this public API.
 */

const SESSION_KEY = "guest_study_session_count";

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
  return !(
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("authToken")
  );
}

export function getGuestSessionCount(): number {
  return readCount(SESSION_KEY);
}

export function incrementGuestSessionCount(): number {
  const next = getGuestSessionCount() + 1;
  writeCount(SESSION_KEY, next);
  return next;
}

/** Clear guest counters after a successful sign-up/login. */
export function clearGuestStudyLimits(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

/** The guest's anon user_id used to key their Study data (for migration). */
export function getGuestUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  return window.localStorage.getItem("user_id") || "anonymous";
}

const PENDING_MIGRATION_KEY = "guest_study_pending_migration";

/**
 * Stash the current guest id right before sending the user through auth, so the
 * workspace can migrate that guest's work onto the new account once they return
 * signed in (login overwrites `user_id` with the real one).
 */
export function stashGuestMigrationId(): void {
  if (typeof window === "undefined") return;
  const id = window.localStorage.getItem("user_id");
  if (id && id.startsWith("guest_")) {
    window.localStorage.setItem(PENDING_MIGRATION_KEY, id);
  }
}

export function takePendingGuestMigrationId(): string | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(PENDING_MIGRATION_KEY);
  if (id) window.localStorage.removeItem(PENDING_MIGRATION_KEY);
  return id;
}
