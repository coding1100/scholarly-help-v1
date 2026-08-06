"use client";

import { clearMemoryAccessToken, readMemoryAccessToken } from "@/app/lib/accessTokenStore";

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
  const apiBase = String(
    process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "",
  ).replace(/\/$/, "");
  if (apiBase) {
    const accessToken = readMemoryAccessToken();
    void fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    }).catch(() => {
      // Local logout must still succeed when the API is unavailable.
    });
  }
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  clearMemoryAccessToken();
  // Expire the middleware cookie too, so SSR/route guards see the logout.
  document.cookie = "access_token=; path=/; max-age=0";
}
