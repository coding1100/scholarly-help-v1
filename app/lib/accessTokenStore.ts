"use client";

const SESSION_HINT_KEY = "sh_has_refresh_session";
let accessToken: string | null = null;

export function readMemoryAccessToken(): string | null {
  return accessToken;
}

export function writeMemoryAccessToken(token: string): void {
  accessToken = token || null;
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem(SESSION_HINT_KEY, "1");
    // Remove credentials written by older deployments.
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("authToken");
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  }
}

export function clearMemoryAccessToken(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_HINT_KEY);
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("authToken");
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  }
}

export function hasRefreshSessionHint(): boolean {
  if (accessToken) return true;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
}
