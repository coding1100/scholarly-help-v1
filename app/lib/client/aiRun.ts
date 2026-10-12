"use client";

/**
 * One user action (a click on Generate, Humanize, Solve...) can make several
 * backend calls, e.g. an essay draft is one call per paragraph and Humanizer
 * also runs the AI detector. Every gated click starts a run, and backend calls
 * made during it carry its id in X-Run-Id, so the server charges the guest or
 * Free-plan allowance once per click instead of once per call. The server caps
 * a run at 10 minutes and 10 calls; the client stops sending it after 10 minutes.
 */
export const RUN_ID_HEADER = "X-Run-Id";
const RUN_TTL_MS = 10 * 60 * 1000;

let current: { id: string; startedAt: number } | null = null;

function newRunId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

/** Starts a new run; called for every gated AI click. */
export function startAiRun(): void {
  current = { id: newRunId(), startedAt: Date.now() };
}

/** The id of the run in progress, or null once it has expired. */
export function currentAiRunId(): string | null {
  if (!current || Date.now() - current.startedAt > RUN_TTL_MS) return null;
  return current.id;
}
