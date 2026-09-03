import { NextRequest } from "next/server";
import { fail } from "./http";

/**
 * Bridges Study Workspace's AI routes (which call Gemini directly from this
 * Next.js process, never through a NestJS controller) into the same
 * free-run-count / credit-balance gate every other tool enforces via
 * @CheckFreeRunQuota / @CheckSubscription. Those are NestJS interceptors
 * tied to that process's request lifecycle, so they can't be reused here —
 * this calls two small backend endpoints instead (BillingController's
 * check-and-reserve / report-usage), the same "call the authoritative
 * backend over HTTP" pattern this module already uses for token verification
 * (see http.ts's verifyUserIdFromToken).
 *
 * Only ever called for a real, non-guest userId — Study Workspace's guest
 * allowance stays exactly as it was (a separate, purely rate-limit-based
 * cap in rateLimit.ts), unaffected by this.
 */

function getAuthApiBaseUrl(): string {
  return String(
    process.env.AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_NGROX_URL ||
      "",
  ).replace(/\/$/, "");
}

export type BillingGateResult =
  | { blocked: false; reservationId: string | null }
  | { blocked: true; response: ReturnType<typeof fail> };

/**
 * Call once before generation, with the same forwarded bearer token the
 * route already validated the user with. On success, returns a
 * reservationId to pass to reportBillingUsage afterward (null for a
 * Free-plan user, whose run is instead recorded by count, not credits).
 * On a 403 from the backend (out of free runs or credits), returns a ready
 * NextResponse carrying the SAME error code the frontend's global billing
 * popup interceptor already recognizes (see ClientScripts.tsx), so Study
 * Workspace gets the identical upgrade-prompt UX as every other tool.
 */
export async function checkAndReserveBillingUsage(input: {
  request: NextRequest;
  service: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
}): Promise<BillingGateResult> {
  const apiBase = getAuthApiBaseUrl();
  const authHeader = input.request.headers.get("authorization") || "";
  if (!apiBase || !authHeader) {
    // No auth header means the caller never got a real userId either — the
    // route's own getAuthenticatedUserId check already handles that guest/
    // unauthenticated path before this is ever called.
    return { blocked: false, reservationId: null };
  }

  const idempotencyKey =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${apiBase}/billing/check-and-reserve`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        service: input.service,
        idempotencyKey,
        estimatedPromptTokens: input.estimatedPromptTokens,
        estimatedCompletionTokens: input.estimatedCompletionTokens,
      }),
    });

    if (response.status === 403) {
      const payload = await response.json().catch(() => ({}) as any);
      const code = payload?.code || payload?.data?.code;
      const message = payload?.message || payload?.data?.message || "Upgrade to keep going.";
      return { blocked: true, response: fail(message, 403, code) };
    }
    if (!response.ok) {
      // Fail OPEN on an unexpected backend error — a billing-check outage
      // must never be the reason a paying-eligible user's tutor question
      // silently breaks. The real gate (free-run count / credit balance)
      // still applies on their NEXT successful check.
      console.error("study.billing: check-and-reserve failed", response.status);
      return { blocked: false, reservationId: null };
    }

    const payload = (await response.json()) as {
      reservationId?: string | null;
    };
    return { blocked: false, reservationId: payload.reservationId ?? null };
  } catch (error) {
    console.error(
      "study.billing: check-and-reserve unavailable",
      error instanceof Error ? error.message : String(error),
    );
    return { blocked: false, reservationId: null };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call after generation completes (success only — a failed generation
 * should not be charged; simply don't call this and the reservation expires
 * on its own via BillingService.releaseOwnExpiredReservations). Fire-and-
 * forget from the route's perspective: never let a reporting failure turn a
 * successful tutor answer into an error response.
 */
export function reportBillingUsage(input: {
  request: NextRequest;
  reservationId: string | null;
  promptTokens: number;
  completionTokens: number;
  model?: string;
}): void {
  const apiBase = getAuthApiBaseUrl();
  const authHeader = input.request.headers.get("authorization") || "";
  if (!apiBase || !authHeader) return;
  // reservationId is null for BOTH the free-run path (nothing to settle,
  // still needs incrementFreeRunsUsed) and the guest path (nothing to
  // report at all) — checkAndReserveBillingUsage's guest short-circuit
  // never reaches here with a route that calls this unconditionally, so
  // callers should still gate this call on "not a guest" themselves.
  void fetch(`${apiBase}/billing/report-usage`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      reservationId: input.reservationId ?? undefined,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      model: input.model,
    }),
  }).catch((error) => {
    console.error(
      "study.billing: report-usage failed",
      error instanceof Error ? error.message : String(error),
    );
  });
}
