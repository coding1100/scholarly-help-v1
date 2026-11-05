"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { isGuest } from "@/app/lib/client/guestClickLimits";

/** Mirrors the backend's HUMANIZER_PUBLIC_CONFIG (GET /tools/humanizer/config). */
export interface HumanizerPublicConfig {
  guest_max_words: number;
  free_max_words: number;
  premium_max_words: number;
}

export const FALLBACK_HUMANIZER_CONFIG: HumanizerPublicConfig = {
  guest_max_words: 300,
  free_max_words: 300,
  premium_max_words: 1500,
};

let cachedConfig: HumanizerPublicConfig | null = null;
let configRequest: Promise<HumanizerPublicConfig> | null = null;

function isHumanizerConfig(value: unknown): value is HumanizerPublicConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<HumanizerPublicConfig>;
  return (
    Number.isFinite(config.guest_max_words) &&
    Number.isFinite(config.free_max_words) &&
    Number.isFinite(config.premium_max_words)
  );
}

async function loadHumanizerConfig(): Promise<HumanizerPublicConfig> {
  if (cachedConfig) return cachedConfig;
  if (!configRequest) {
    configRequest = axios
      .get(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/config`)
      .then((response) => {
        const candidate = response.data?.data ?? response.data;
        cachedConfig = isHumanizerConfig(candidate)
          ? candidate
          : FALLBACK_HUMANIZER_CONFIG;
        return cachedConfig;
      })
      .catch(() => FALLBACK_HUMANIZER_CONFIG)
      .finally(() => {
        configRequest = null;
      });
  }
  return configRequest;
}

/**
 * The backend's tier (guest / Free / Premium — see `plan` in the User schema)
 * is the source of truth and is re-checked on every submit; `package_type`
 * mirrored to localStorage on sign-in is only this client-side preview's best
 * guess at which number to show/pre-validate against before that round trip.
 * The backend creates every Free-plan account with `package_type: 'none'`
 * (see AuthService), so "none" (or absent, e.g. a guest) reads as Free/guest
 * here and anything else reads as a paid package.
 */
function resolveMaxWords(config: HumanizerPublicConfig): number {
  if (isGuest()) return config.guest_max_words;
  const packageType =
    typeof window !== "undefined"
      ? window.localStorage.getItem("package_type")
      : null;
  const isPaid = !!packageType && packageType !== "none";
  return isPaid ? config.premium_max_words : config.free_max_words;
}

/**
 * The API is the canonical source for the humanizer's word-limit tiers. The
 * matching fallback keeps the form usable during a rolling deployment or a
 * transient config error — mirrors useDetectorConfig.
 */
export function useHumanizerConfig(): {
  config: HumanizerPublicConfig;
  maxWords: number;
} {
  const [config, setConfig] = useState<HumanizerPublicConfig>(
    cachedConfig ?? FALLBACK_HUMANIZER_CONFIG,
  );
  // This component is server-rendered on first load. `resolveMaxWords` reads
  // `isGuest()`/localStorage, which don't exist yet on the server and would
  // read differently once hydrated on the client — computing it inline
  // during render would hydrate-mismatch for a paid user (server: no window
  // → treated as non-guest/Free; client: the real tier). Deferring the read
  // to an effect keeps the first paint (server and client) identical, then
  // corrects to the real tier right after mount, same as this file's `token`.
  const [maxWords, setMaxWords] = useState<number>(config.free_max_words);

  useEffect(() => {
    let active = true;
    void loadHumanizerConfig().then((nextConfig) => {
      if (!active) return;
      setConfig(nextConfig);
      setMaxWords(resolveMaxWords(nextConfig));
    });
    return () => {
      active = false;
    };
    // Re-resolving against `config` (possibly already cached from an earlier
    // mount, in which case the fetch above resolves instantly with the same
    // object and this effect wouldn't otherwise re-run) only needs to happen
    // once on mount — deliberately excluding `config` from the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { config, maxWords };
}
