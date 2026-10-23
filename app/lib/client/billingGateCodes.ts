import { markGuestClickLimitReached } from "@/app/lib/client/guestClickLimits";

/**
 * Error codes the backend attaches to a 403 when the next step is a popup
 * rather than a retry:
 *   - FREE_RUN_LIMIT_EXCEEDED / INSUFFICIENT_CREDITS (run-quota.service.ts,
 *     check-subscription.decorator.ts): upgrade, so the billing popup opens.
 *   - GUEST_RUN_LIMIT_EXCEEDED (run-quota.service.ts): the guest's free try is
 *     used, so the sign-up gate opens.
 * ClientScripts.tsx's global axios interceptor opens the matching popup for any
 * 403 carrying one of these.
 *
 * Tools that also show their own local error toast on a 403 (word-limit
 * exceeded, etc.) should skip that toast for these specific codes — the
 * popup opening already tells the user what happened and what to do next;
 * stacking a generic "you don't have enough tokens" toast on top of it is
 * redundant and reads as a dead end since the popup is the actual next step.
 */
const BILLING_GATE_CODES = new Set(["FREE_RUN_LIMIT_EXCEEDED", "INSUFFICIENT_CREDITS"]);
const GUEST_GATE_CODE = "GUEST_RUN_LIMIT_EXCEEDED";

function isGateCode(code: unknown): boolean {
  return BILLING_GATE_CODES.has(code as string) || code === GUEST_GATE_CODE;
}

export function isBillingGateError(err: any): boolean {
  return err?.response?.status === 403 && isGateCode(err?.response?.data?.code);
}

/**
 * Same check as isBillingGateError, for callers that use plain fetch instead
 * of axios (e.g. Study Workspace's studyApiClient.ts) and so never pass
 * through ClientScripts.tsx's global axios interceptor. Call this from a
 * fetch response's parsed JSON body on a 403, then dispatch the same event
 * the interceptor would have via dispatchBillingGateEvent below.
 */
export function isBillingGateResponseBody(status: number, body: any): boolean {
  return status === 403 && isGateCode(body?.code);
}

/**
 * Opens the popup for a gate code: the sign-up gate for a guest (see
 * GuestRunGate.tsx), otherwise the billing popup (see BillingGate.tsx).
 */
export function dispatchBillingGateEvent(code?: string): void {
  if (typeof window === "undefined") return;
  if (code === GUEST_GATE_CODE) {
    markGuestClickLimitReached();
    window.dispatchEvent(new CustomEvent("guest:run-limit-exceeded"));
    return;
  }
  window.dispatchEvent(new CustomEvent("billing:free-run-limit-exceeded"));
}
