import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

/** One-way hash of the client IP, so rate limits work without storing raw IPs. */
export function clientIpHash(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const secret = process.env.TOOL_USAGE_HASH_SECRET || process.env.JWT_SECRET || "blog";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

/**
 * Cheap bot checks for public forms:
 * - `website` is a hidden honeypot field humans never fill in
 * - `startedAt` is when the form rendered; real people take more than a few seconds
 */
export function looksAutomated(body: Record<string, unknown>, minSeconds = 3): boolean {
  if (typeof body.website === "string" && body.website.trim() !== "") return true;
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt)) return true;
  const elapsed = (Date.now() - startedAt) / 1000;
  return elapsed < minSeconds || elapsed > 60 * 60 * 24;
}

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) || []).length;
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
