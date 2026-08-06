"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type CacheEntry<T> = { expiresAt: number; value: Promise<T> };
const requestCache = new Map<string, CacheEntry<unknown>>();

/** Deduplicates concurrent reads and keeps successful results for a short TTL. */
export async function cachedRequest<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 30_000,
): Promise<T> {
  const now = Date.now();
  const existing = requestCache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) return existing.value;

  const value = loader().catch((error) => {
    requestCache.delete(key);
    throw error;
  });
  requestCache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}

export function invalidateCachedRequest(prefix: string) {
  for (const key of requestCache.keys()) {
    if (key.startsWith(prefix)) requestCache.delete(key);
  }
}

/** Keeps one active operation and aborts it when superseded or unmounted. */
export function useLatestAbortController() {
  const ref = useRef<AbortController | null>(null);
  useEffect(() => () => ref.current?.abort(), []);
  return () => {
    ref.current?.abort();
    const controller = new AbortController();
    ref.current = controller;
    return controller;
  };
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!validate || validate(parsed)) setValue(parsed as T);
      }
    } catch {
      window.localStorage.removeItem(key);
    } finally {
      setHydrated(true);
    }
  }, [key, validate]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private mode; the in-memory state remains usable.
    }
  }, [hydrated, key, value]);

  return [value, setValue, hydrated];
}

export function uniqueCleanStrings(value: unknown, max = 20): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const clean = item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim();
    const key = clean.toLocaleLowerCase();
    if (clean.length < 3 || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length === max) break;
  }
  return result;
}

export type RankedText = { text: string; score: number; reasons: string[] };

export function rankAcademicText(
  values: unknown,
  kind: "title" | "question" | "thesis",
): RankedText[] {
  return uniqueCleanStrings(values).map((text) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    let score = 50;
    const reasons: string[] = [];
    if (kind === "title") {
      if (words >= 6 && words <= 18) { score += 25; reasons.push("clear length"); }
      if (/[:—-]/.test(text)) { score += 8; reasons.push("specific framing"); }
      if (!/[.!?]$/.test(text)) score += 7;
    } else if (kind === "question") {
      if (text.endsWith("?")) { score += 15; reasons.push("valid question"); }
      if (/\b(how|why|what|which|to what extent|does|do|is|are)\b/i.test(text)) score += 12;
      if (/\b(among|within|between|during|in the context of)\b/i.test(text)) {
        score += 10; reasons.push("bounded scope");
      }
      if (words >= 8 && words <= 30) score += 8;
    } else {
      if (words >= 12 && words <= 45) score += 15;
      if (/\b(because|therefore|although|while|should|must|demonstrates|argues)\b/i.test(text)) {
        score += 15; reasons.push("argument and rationale");
      }
    }
    return { text, score: Math.min(100, score), reasons };
  }).sort((a, b) => b.score - a.score);
}

export function strictFiniteNumber(value: string): number | null {
  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function formatAdaptiveNumber(value: number): string {
  const abs = Math.abs(value);
  if ((abs !== 0 && abs < 1e-6) || abs >= 1e12) return value.toExponential(8);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 }).format(value);
}
