"use client";

import { useWordLimitConfig, type WordLimitConfig } from "@/app/lib/client/useWordLimitConfig";

/** Mirrors the backend's HUMANIZER_PUBLIC_CONFIG (GET /tools/humanizer/config). */
export const FALLBACK_HUMANIZER_CONFIG: WordLimitConfig = {
  guest_max_words: 300,
  free_max_words: 300,
  premium_max_words: 1500,
};

export function useHumanizerConfig() {
  return useWordLimitConfig("/tools/humanizer/config", FALLBACK_HUMANIZER_CONFIG);
}
