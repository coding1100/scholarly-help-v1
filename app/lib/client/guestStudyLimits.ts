"use client";

/**
 * Client-side guest limits for the AI Study Workspace.
 *
 * A logged-out ("guest") user gets a small free allowance:
 *   - unlimited study sessions (the email barrier was removed from session
 *     creation; sessions are still counted for analytics/migration)
 *   - 3 tutor queries (questions asked against their sources). The 4th query
 *     opens the email gate.
 *
 * Counts are LIFETIME (never reset) and stored in localStorage. This is an
 * intentionally temporary, client-only scheme — it does not survive the user
 * clearing storage / using incognito. If/when this needs to be tamper-proof,
 * swap the bodies of these functions for server-backed counters; the rest of
 * the app only depends on this module's public API.
 */

export const GUEST_QUERY_LIMIT = 3;

const QUERY_KEY = "guest_study_query_count";
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

export function getGuestQueryCount(): number {
  return readCount(QUERY_KEY);
}

export function getGuestSessionCount(): number {
  return readCount(SESSION_KEY);
}

export function incrementGuestQueryCount(): number {
  const next = getGuestQueryCount() + 1;
  writeCount(QUERY_KEY, next);
  return next;
}

export function incrementGuestSessionCount(): number {
  const next = getGuestSessionCount() + 1;
  writeCount(SESSION_KEY, next);
  return next;
}

/** True when a guest has already used all free queries (gate the next one). */
export function hasReachedGuestQueryLimit(): boolean {
  return isGuest() && getGuestQueryCount() >= GUEST_QUERY_LIMIT;
}

/** Clear guest counters after a successful sign-up/login. */
export function clearGuestStudyLimits(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUERY_KEY);
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
