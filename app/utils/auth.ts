"use client";

/**
 * All auth/session keys written to localStorage across the app. Centralized so
 * logout clears the same set everywhere (previously this list was duplicated in
 * AccountPopover and MTSidebar and had drifted out of sync).
 */
const AUTH_STORAGE_KEYS = [
  "access_token",
  "refresh_token",
  "user",
  "user_id",
  "user_name",
  "user_email",
  "package_type",
  "totalTokens",
  "provider",
  "profile_image",
  "authState",
  "user_password",
  "authToken",
  "localUserId",
] as const;

/** Clear the persisted session (localStorage + the access_token cookie). */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  // Expire the middleware cookie too, so SSR/route guards see the logout.
  document.cookie = "access_token=; path=/; max-age=0";
}
