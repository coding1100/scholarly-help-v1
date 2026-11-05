"use client";

import { fetchWithAuthRetry, getAccessToken } from "@/app/lib/authSession";

/** Mirrors the backend's ToolHistory schema (GET/POST /v1/tool-history). */
export interface ToolHistoryEntryDto {
  _id: string;
  tool_key: string;
  tool_name: string;
  href: string;
  title: string;
  metric_label?: string | null;
  metric_before?: number | null;
  metric_after?: number | null;
  resource_id?: string | null;
  createdAt: string;
}

export interface ToolHistoryPage {
  items: ToolHistoryEntryDto[];
  total: number;
}

export interface RecordToolRunInput {
  toolKey: string;
  toolName: string;
  href: string;
  /** Raw user input; collapsed into a short label before it is sent. */
  title: string;
  metricLabel?: string;
  metricBefore?: number;
  metricAfter?: number;
  resourceId?: string;
}

function historyUrl(path = ""): string {
  const base = String(process.env.NEXT_PUBLIC_NGROX_URL || "").replace(/\/$/, "");
  return `${base}/tool-history${path}`;
}

/**
 * Collapse the user's input into a short label. Mirrors the backend's
 * `ToolHistoryService.deriveTitle` so a row reads the same whichever side
 * produced it; the backend still enforces the length cap.
 */
export function deriveHistoryTitle(input: string, fallback: string): string {
  const firstLine = (input || "").replace(/\s+/g, " ").trim().slice(0, 160);
  if (!firstLine) return fallback;
  const sentenceEnd = firstLine.search(/[.!?]\s/);
  const candidate = sentenceEnd > 20 ? firstLine.slice(0, sentenceEnd) : firstLine;
  return candidate.length > 70
    ? `${candidate.slice(0, 67).trimEnd()}...`
    : candidate;
}

function toPercent(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Record a completed tool run for the dashboard's "Recent work" panel.
 *
 * Fire-and-forget by design: history is a convenience surface, so a failure
 * here must never surface an error over a result the user already has, nor
 * block the tool's own render. Guests have no account to attach history to and
 * are skipped without a request.
 */
export async function recordToolRun(input: RecordToolRunInput): Promise<void> {
  if (typeof window === "undefined") return;
  if (!getAccessToken()) return;

  const title = deriveHistoryTitle(input.title, input.toolName);
  if (!title) return;

  try {
    await fetchWithAuthRetry(historyUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool_key: input.toolKey,
        tool_name: input.toolName,
        href: input.href,
        title,
        ...(input.metricLabel ? { metric_label: input.metricLabel } : {}),
        ...(toPercent(input.metricBefore) !== undefined
          ? { metric_before: toPercent(input.metricBefore) }
          : {}),
        ...(toPercent(input.metricAfter) !== undefined
          ? { metric_after: toPercent(input.metricAfter) }
          : {}),
        ...(input.resourceId ? { resource_id: input.resourceId } : {}),
      }),
    });
  } catch (error) {
    // Never let history bookkeeping break a tool that already succeeded.
    console.error("toolHistory.record failed", error);
  }
}

export async function listToolRuns(
  limit = 5,
  skip = 0,
): Promise<ToolHistoryPage> {
  if (typeof window === "undefined" || !getAccessToken()) {
    return { items: [], total: 0 };
  }

  const response = await fetchWithAuthRetry(
    historyUrl(`?limit=${limit}&skip=${skip}`),
    { method: "GET" },
  );
  if (!response.ok) {
    throw new Error(`Failed to load recent work (${response.status})`);
  }
  const payload = await response.json();
  const data = payload?.data ?? payload;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number.isFinite(data?.total) ? Number(data.total) : 0,
  };
}

export async function deleteToolRun(id: string): Promise<void> {
  if (typeof window === "undefined" || !getAccessToken()) return;
  await fetchWithAuthRetry(historyUrl(`/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
}

/** Human-readable age for a history row, e.g. "Yesterday", "Mon". */
export function formatHistoryTimestamp(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfThen = new Date(
    then.getFullYear(),
    then.getMonth(),
    then.getDate(),
  ).getTime();
  const dayDiff = Math.round((startOfToday - startOfThen) / 86_400_000);

  if (dayDiff <= 0) {
    const minutes = Math.round((now.getTime() - then.getTime()) / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.round(minutes / 60)}h ago`;
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return then.toLocaleDateString(undefined, { weekday: "short" });
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
