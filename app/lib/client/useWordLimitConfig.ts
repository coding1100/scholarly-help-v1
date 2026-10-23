"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { isGuest } from "@/app/lib/client/guestClickLimits";

/** A tool's public word-limit tiers, e.g. GET /tools/humanizer/config. */
export interface WordLimitConfig {
  guest_max_words: number;
  free_max_words: number;
  premium_max_words: number;
}

const cache = new Map<string, WordLimitConfig>();
const inFlight = new Map<string, Promise<WordLimitConfig>>();

function isWordLimitConfig(value: unknown): value is WordLimitConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<WordLimitConfig>;
  return (
    Number.isFinite(config.guest_max_words) &&
    Number.isFinite(config.free_max_words) &&
    Number.isFinite(config.premium_max_words)
  );
}

function loadConfig(path: string, fallback: WordLimitConfig): Promise<WordLimitConfig> {
  const cached = cache.get(path);
  if (cached) return Promise.resolve(cached);
  let request = inFlight.get(path);
  if (!request) {
    request = axios
      .get(`${process.env.NEXT_PUBLIC_NGROX_URL}${path}`)
      .then((response) => {
        const candidate = response.data?.data ?? response.data;
        const config = isWordLimitConfig(candidate) ? candidate : fallback;
        cache.set(path, config);
        return config;
      })
      .catch(() => fallback)
      .finally(() => {
        inFlight.delete(path);
      });
    inFlight.set(path, request);
  }
  return request;
}

/**
 * The backend's tier (guest / Free / Premium, see `plan` in the User schema)
 * is the source of truth and is re-checked on every submit; `package_type`
 * mirrored to localStorage on sign-in is only this client-side preview's best
 * guess at which number to show/pre-validate against before that round trip.
 * The backend creates every Free-plan account with `package_type: 'none'`
 * (see AuthService), so "none" (or absent, e.g. a guest) reads as Free/guest
 * here and anything else reads as a paid package.
 */
function resolveMaxWords(config: WordLimitConfig): number {
  if (isGuest()) return config.guest_max_words;
  const packageType = window.localStorage.getItem("package_type");
  const isPaid = !!packageType && packageType !== "none";
  return isPaid ? config.premium_max_words : config.free_max_words;
}

/**
 * The word limit to show and pre-validate against for the current visitor.
 * The API is the canonical source; `fallback` (matching the backend's
 * constants) keeps the form usable during a rolling deployment or a transient
 * config error.
 */
export function useWordLimitConfig(
  path: string,
  fallback: WordLimitConfig,
): { config: WordLimitConfig; maxWords: number } {
  const [config, setConfig] = useState<WordLimitConfig>(cache.get(path) ?? fallback);
  // This component is server-rendered on first load. `resolveMaxWords` reads
  // `isGuest()`/localStorage, which don't exist yet on the server and would
  // read differently once hydrated on the client. Computing it inline
  // during render would hydrate-mismatch for a paid user (server: no window
  // → treated as non-guest/Free; client: the real tier). Deferring the read
  // to an effect keeps the first paint (server and client) identical, then
  // corrects to the real tier right after mount.
  const [maxWords, setMaxWords] = useState<number>(config.free_max_words);

  useEffect(() => {
    let active = true;
    void loadConfig(path, fallback).then((nextConfig) => {
      if (!active) return;
      setConfig(nextConfig);
      setMaxWords(resolveMaxWords(nextConfig));
    });
    return () => {
      active = false;
    };
    // The path and fallback are constants per tool; resolving once on mount is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { config, maxWords };
}
