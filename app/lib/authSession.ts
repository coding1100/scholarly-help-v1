"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthSession } from "@/app/utils/auth";
import {
  hasRefreshSessionHint,
  readMemoryAccessToken,
  writeMemoryAccessToken,
} from "@/app/lib/accessTokenStore";

const SESSION_EXPIRED_EVENT = "sh:session-expired";
let refreshInFlight: Promise<string> | null = null;
let bootstrapInFlight: Promise<string | null> | null = null;
let bootstrapComplete = false;

class SessionRefreshError extends Error {
  constructor(public readonly status: number) {
    super(`Session refresh failed with status ${status}`);
  }
}

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

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function getAccessToken(): string | null {
  return readMemoryAccessToken();
}

export function persistAccessToken(
  accessToken: string,
  expiresInSeconds = 3600,
): void {
  if (typeof window === "undefined" || !accessToken) return;
  writeMemoryAccessToken(accessToken);
  bootstrapComplete = true;
  window.dispatchEvent(new CustomEvent("sh:auth-session-changed"));
}

function expireLocalSession(): void {
  clearAuthSession();
  try {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  } catch {
    // The storage cleanup above is the important fallback.
  }
}

export async function refreshAccessToken(options?: {
  silentUnauthorized?: boolean;
}): Promise<string> {
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
      throw new SessionRefreshError(response.status);
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
      if (
        !options?.silentUnauthorized &&
        error instanceof SessionRefreshError &&
        [401, 403].includes(error.status)
      ) {
        expireLocalSession();
      }
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/** Restore an authenticated page after reload without exposing the refresh
 * token or access token to persistent JavaScript storage. */
export async function initializeAuthSession(): Promise<string | null> {
  const current = getAccessToken();
  if (current) return current;
  if (bootstrapComplete) return null;
  if (bootstrapInFlight) return bootstrapInFlight;
  bootstrapInFlight = refreshAccessToken({
    silentUnauthorized: !hasRefreshSessionHint(),
  })
    .catch(() => null)
    .finally(() => {
      bootstrapComplete = true;
      bootstrapInFlight = null;
    });
  return bootstrapInFlight;
}

export async function getOrRefreshAccessToken(): Promise<string | null> {
  return getAccessToken() || initializeAuthSession();
}

/**
 * Installs one global Axios policy: send the latest token and retry a backend
 * request exactly once after a single shared refresh operation.
 */
export function installAxiosAuthRefresh(): () => void {
  const requestInterceptor = axios.interceptors.request.use(async (config) => {
    if (
      !isBackendRequest(config.url, config.baseURL) ||
      isAuthRequest(config.url)
    ) {
      return config;
    }

    const token = await getOrRefreshAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    const method = String(config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !config.headers.has('Idempotency-Key')) {
      config.headers.set('Idempotency-Key', newIdempotencyKey());
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
        !hasRefreshSessionHint() ||
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
  const stableHeaders = new Headers(init.headers);
  const method = String(init.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !stableHeaders.has('Idempotency-Key')) {
    stableHeaders.set('Idempotency-Key', newIdempotencyKey());
  }
  const request = async (token: string | null) => {
    const headers = new Headers(stableHeaders);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: "include" });
  };

  const currentToken = await getOrRefreshAccessToken();
  const response = await request(currentToken);
  if (response.status !== 401 || !hasRefreshSessionHint()) return response;

  const refreshedToken = await refreshAccessToken();
  return request(refreshedToken);
}

export { SESSION_EXPIRED_EVENT };
