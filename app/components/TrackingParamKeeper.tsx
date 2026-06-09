"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mergeSearchParams } from "@/app/utils/url";

const STORAGE_KEY = "sh:trackingParams";

function getStoredParams(): URLSearchParams | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const sp = new URLSearchParams();
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === "string" && v.length) sp.set(k, v);
    });
    return sp;
  } catch {
    return null;
  }
}

function storeParams(params: URLSearchParams) {
  if (typeof window === "undefined") return;
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    // Keep everything except internal navigation params.
    if (key === "returnUrl") return;
    obj[key] = value;
  });
  if (Object.keys(obj).length === 0) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

/**
 * Ensures query params (fbclid/utm_*) don't disappear across auth/tools navigation.
 * - If current URL has params, store them in sessionStorage.
 * - If current URL has no params but stored params exist, re-attach them via router.replace.
 */
export default function TrackingParamKeeper() {
  const router = useRouter();
  const pathname = usePathname();
  const didRestoreRef = useRef(false);

  useEffect(() => {
    const currentQs =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    const current = new URLSearchParams(currentQs);
    if (currentQs) {
      storeParams(current);
      return;
    }

    if (didRestoreRef.current) return;
    const stored = getStoredParams();
    if (!stored || Array.from(stored.keys()).length === 0) return;

    // If stored has at least one key not present, restore.
    let missing = false;
    stored.forEach((_, key) => {
      if (!current.has(key)) missing = true;
    });
    if (!missing) return;

    didRestoreRef.current = true;
    const base = pathname || "/";
    const merged = mergeSearchParams(base, stored, { excludeKeys: ["returnUrl"] });
    router.replace(merged);
  }, [pathname, router]);

  return null;
}

