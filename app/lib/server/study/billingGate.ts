import { NextRequest } from "next/server";
import { fail, getClientIp } from "./http";
import { consumeStudyAiQuota, releaseStudyAiQuota } from "./rateLimit";

/**
 * Bridges Study Workspace's AI routes (which call Gemini directly from this
 * Next.js process, never through a NestJS controller) into the same run and
 * credit allowances every other tool enforces via @CheckFreeRunQuota /
 * @CheckSubscription:
 *   - guests: one run per IP per day, counted here (the backend never sees a
 *     guest's IP on a server-to-server call);
 *   - signed-in users: the backend's check-and-reserve / report-usage
 *     endpoints (a Free run, or a Premium credit reservation).
 * A run is closed exactly once: `succeed` reports the real usage, `fail` gives
 * the run or reservation back.
 */

const GUEST_RUNS_PER_IP_PER_DAY = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const BILLING_TIMEOUT_MS = 8_000;

function getAuthApiBaseUrl(): string {
  return String(
    process.env.AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_NGROX_URL ||
      "",
  ).replace(/\/$/, "");
}

export interface StudyRun {
  succeed(usage: { promptTokens: number; completionTokens: number; model?: string }): void;
  fail(): void;
}

export type StudyRunStart =
  | { blocked: false; run: StudyRun }
  | { blocked: true; response: ReturnType<typeof fail> };

type BillingTicket = { reservationId: string | null; runRefundToken: string | null };

/**
 * Call once before generation. `countRun: false` is for follow-up work on a
 * run already paid for (grading a quiz answer, transcribing a recording): it
 * still requires an allowance but spends no guest or Free run.
 */
export async function startStudyRun(input: {
  request: NextRequest;
  userId: string;
  service: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  countRun?: boolean;
}): Promise<StudyRunStart> {
  const countRun = input.countRun !== false;
  const isGuest = input.userId.startsWith("guest_") || input.userId.startsWith("guest:");

  if (isGuest) {
    if (!countRun) return { blocked: false, run: closeOnce({}) };
    const key = `guest-run:ip:${getClientIp(input.request) || input.userId}`;
    const quota = consumeStudyAiQuota({ key, limit: GUEST_RUNS_PER_IP_PER_DAY, windowMs: DAY_MS });
    if (!quota.allowed) {
      return {
        blocked: true,
        response: fail(
          "You've used your free try. Sign up free to keep going.",
          403,
          "GUEST_RUN_LIMIT_EXCEEDED",
        ),
      };
    }
    return { blocked: false, run: closeOnce({ onFail: () => releaseStudyAiQuota(key) }) };
  }

  const checked = await checkAndReserve(input, countRun);
  if (checked.blocked) return checked;
  const ticket = checked.ticket;
  return {
    blocked: false,
    run: closeOnce({
      onSucceed: (usage) => {
        if (ticket.reservationId) report(input.request, { reservationId: ticket.reservationId, ...usage });
      },
      onFail: () => {
        if (ticket.reservationId || ticket.runRefundToken) {
          report(input.request, {
            reservationId: ticket.reservationId ?? undefined,
            runRefundToken: ticket.runRefundToken ?? undefined,
            promptTokens: 0,
            completionTokens: 0,
            failed: true,
          });
        }
      },
    }),
  };
}

function closeOnce(handlers: {
  onSucceed?: (usage: { promptTokens: number; completionTokens: number; model?: string }) => void;
  onFail?: () => void;
}): StudyRun {
  let closed = false;
  return {
    succeed(usage) {
      if (closed) return;
      closed = true;
      handlers.onSucceed?.(usage);
    },
    fail() {
      if (closed) return;
      closed = true;
      handlers.onFail?.();
    },
  };
}

/**
 * Asks the backend for a Free run or a Premium reservation. Fails CLOSED: if
 * the billing service cannot answer (after one retry), the run is refused with
 * a 503 rather than allowed through unmetered.
 */
async function checkAndReserve(
  input: {
    request: NextRequest;
    service: string;
    estimatedPromptTokens: number;
    estimatedCompletionTokens: number;
  },
  countRun: boolean,
): Promise<{ blocked: false; ticket: BillingTicket } | { blocked: true; response: ReturnType<typeof fail> }> {
  const apiBase = getAuthApiBaseUrl();
  const authHeader = input.request.headers.get("authorization") || "";
  const unavailable = () => ({
    blocked: true as const,
    response: fail("Billing is temporarily unavailable. Please try again in a moment.", 503),
  });
  if (!apiBase || !authHeader) return unavailable();

  const body = JSON.stringify({
    service: input.service,
    idempotencyKey: crypto.randomUUID(),
    estimatedPromptTokens: input.estimatedPromptTokens,
    estimatedCompletionTokens: input.estimatedCompletionTokens,
    countRun,
  });

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BILLING_TIMEOUT_MS);
    try {
      const response = await fetch(`${apiBase}/billing/check-and-reserve`, {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body,
      });
      if (response.status === 403) {
        const payload = await response.json().catch(() => ({}) as any);
        const code = payload?.code || payload?.data?.code;
        const message = payload?.message || payload?.data?.message || "Upgrade to keep going.";
        return { blocked: true, response: fail(message, 403, code) };
      }
      if (response.ok) {
        const payload = await response.json();
        const data = payload?.data ?? payload;
        return {
          blocked: false,
          ticket: {
            reservationId: data?.reservationId ?? null,
            runRefundToken: data?.runRefundToken ?? null,
          },
        };
      }
      console.error("study.billing: check-and-reserve failed", response.status);
    } catch (error) {
      console.error(
        "study.billing: check-and-reserve unavailable",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
  return unavailable();
}

/** Fire-and-forget: a reporting failure must never turn a finished answer into an error. */
function report(
  request: NextRequest,
  body: {
    reservationId?: string;
    runRefundToken?: string;
    promptTokens: number;
    completionTokens: number;
    model?: string;
    failed?: boolean;
  },
): void {
  const apiBase = getAuthApiBaseUrl();
  const authHeader = request.headers.get("authorization") || "";
  if (!apiBase || !authHeader) return;
  void fetch(`${apiBase}/billing/report-usage`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  }).catch((error) => {
    console.error(
      "study.billing: report-usage failed",
      error instanceof Error ? error.message : String(error),
    );
  });
}
