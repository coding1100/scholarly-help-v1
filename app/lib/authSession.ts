"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthSession } from "@/app/utils/auth";

const SESSION_EXPIRED_EVENT = "sh:session-expired";
let refreshInFlight: Promise<string> | null = null;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  __sessionRefreshRetried?: boolean;
};

function apiBase(): string {
  return String(
    process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_API_URL || "",
  ).replace(/\/$/, "");
}

function isBackendRequest(url?: string, baseURL?: string): boolean {
  const base = apiBase();
  if (!base || !url) return false;
  try {
    return new URL(url, baseURL || window.location.origin).href.startsWith(
      `${base}/`,
    );
  } catch {
    return url.startsWith(base);
  }
}

function isAuthRequest(url?: string): boolean {
  return Boolean(
    url &&
    /\/auth\/(signin|verify-email|google\/signin|refresh|session|logout)(?:[/?]|$)/.test(
      url,
    ),
  );
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

export function persistAccessToken(
  accessToken: string,
  expiresInSeconds = 3600,
): void {
  if (typeof window === "undefined" || !accessToken) return;
  const safeMaxAge = Math.max(60, Number(expiresInSeconds) || 3600);
  window.localStorage.setItem("access_token", accessToken);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${safeMaxAge}; SameSite=Lax${secure}`;
}

function expireLocalSession(): void {
  clearAuthSession();
  try {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  } catch {
    // The storage cleanup above is the important fallback.
  }
}

export async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  const base = apiBase();
  if (!base) throw new Error("Missing API URL");

  refreshInFlight = (async () => {
    const response = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Session refresh failed with status ${response.status}`);
    }

    const raw = await response.json();
    const session = raw?.data ?? raw;
    if (!session?.access_token) {
      throw new Error("Session refresh did not return an access token");
    }

    persistAccessToken(session.access_token, session.expires_in);
    return session.access_token as string;
  })()
    .catch((error) => {
      expireLocalSession();
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Installs one global Axios policy: send the latest token and retry a backend
 * request exactly once after a single shared refresh operation.
 */
export function installAxiosAuthRefresh(): () => void {
  const requestInterceptor = axios.interceptors.request.use((config) => {
    if (
      !isBackendRequest(config.url, config.baseURL) ||
      isAuthRequest(config.url)
    ) {
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  const responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableRequestConfig | undefined;
      if (
        error.response?.status !== 401 ||
        !config ||
        config.__sessionRefreshRetried ||
        !getAccessToken() ||
        !isBackendRequest(config.url, config.baseURL) ||
        isAuthRequest(config.url)
      ) {
        return Promise.reject(error);
      }

      config.__sessionRefreshRetried = true;
      const accessToken = await refreshAccessToken();
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      return axios.request(config);
    },
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptor);
    axios.interceptors.response.eject(responseInterceptor);
  };
}

/** Fetch equivalent for the few API clients that do not use Axios. */
export async function fetchWithAuthRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const request = async (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: "include" });
  };

  const currentToken = getAccessToken();
  const response = await request(currentToken);
  if (response.status !== 401 || !currentToken) return response;

  const refreshedToken = await refreshAccessToken();
  return request(refreshedToken);
}

export { SESSION_EXPIRED_EVENT };
