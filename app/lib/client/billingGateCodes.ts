/**
 * Error codes the backend attaches to a 403 when the fix is "upgrade your
 * plan" (see free-run-quota.decorator.ts's FREE_RUN_LIMIT_EXCEEDED and
 * billing.service.ts / check-subscription.decorator.ts's
 * INSUFFICIENT_CREDITS). ClientScripts.tsx's global axios interceptor opens
 * the billing popup for any 403 carrying one of these.
 *
 * Tools that also show their own local error toast on a 403 (word-limit
 * exceeded, etc.) should skip that toast for these specific codes — the
 * popup opening already tells the user what happened and what to do next;
 * stacking a generic "you don't have enough tokens" toast on top of it is
 * redundant and reads as a dead end since the popup is the actual next step.
 */
export function isBillingGateError(err: any): boolean {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;
  return status === 403 && (code === "FREE_RUN_LIMIT_EXCEEDED" || code === "INSUFFICIENT_CREDITS");
}
