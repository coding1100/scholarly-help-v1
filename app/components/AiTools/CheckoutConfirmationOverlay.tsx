"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

declare global {
  interface Window {
    // Matches the declaration in SocialAuthButtons.tsx — TS requires
    // identical types across merged global declarations.
    dataLayer?: Array<Record<string, any>>;
  }
}

/**
 * Pushes a GTM conversion event for the ads team (GTM container is loaded
 * site-wide in app/layout.tsx — GTM-5ZHV46X). Fired exactly once, from the
 * one place in the app that has actually confirmed payment server-side (see
 * the component doc comment below), so it can't fire on an abandoned/failed
 * Stripe session and can't double-fire on refresh (stripParams() removes the
 * query params that gate this whole effect).
 *
 * `value`/`currency`/`plan` come from the backend's confirm-checkout
 * response (amount_total/currency/plan on WebhookService.confirmCheckoutSession
 * — Stripe's own values off the Checkout Session, amount in the smallest
 * currency unit e.g. cents). Convert amount_total to major currency units
 * for analytics. A response must explicitly confirm provisioned: true;
 * missing monetary fields are omitted rather than blocking the event.
 * Ads Manager: build the Google Ads / Meta conversion tags in GTM off this
 * "tool_purchase" dataLayer event (named to avoid colliding with an existing
 * "purchase" event already used elsewhere in GTM) — no further app code
 * changes needed for that.
 */
type CheckoutConfirmation = {
  provisioned?: boolean;
  amount_total?: number | null;
  currency?: string | null;
  plan?: string;
  plan_id?: string;
};

function pushPurchaseConversion(sessionId: string, confirmData?: CheckoutConfirmation | null) {
  if (confirmData?.provisioned !== true) return;

  const currency = confirmData.currency?.toUpperCase();
  let value: number | undefined;
  if (
    currency &&
    typeof confirmData.amount_total === "number" &&
    Number.isSafeInteger(confirmData.amount_total) &&
    confirmData.amount_total >= 0
  ) {
    try {
      // Stripe charges use hundredths for these currencies regardless of
      // display/payout rounding rules: https://docs.stripe.com/currencies
      const decimals = ["ISK", "UGX", "HUF", "TWD"].includes(currency)
        ? 2
        : new Intl.NumberFormat("en", { style: "currency", currency })
            .resolvedOptions().maximumFractionDigits ?? 2;
      value = confirmData.amount_total / 10 ** decimals;
    } catch {
      // An invalid currency must not produce a guessed conversion value.
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "tool_purchase",
    transaction_id: sessionId,
    value,
    currency,
    plan: confirmData?.plan_id ?? confirmData?.plan ?? undefined,
  });
}

/**
 * Mounted globally (see ClientScripts.tsx). When Stripe redirects back from
 * a successful checkout, StripeService appends ?upgraded=1&session_id=...
 * to the return URL (session_id is Stripe's own {CHECKOUT_SESSION_ID}
 * placeholder, substituted at redirect time).
 *
 * Rather than silently trusting that the invoice.paid webhook has already
 * landed, this briefly blocks the page with a loader while it calls
 * GET /billing/confirm-checkout, which eagerly grants the plan if the
 * webhook hasn't arrived yet (see WebhookService.confirmCheckoutSession —
 * idempotent alongside the webhook, so calling both is always safe). That
 * closes the narrow window where a user could land back on their tool and
 * immediately get gated again because the webhook was still in flight.
 *
 * Removes checkout parameters only after confirmed success. Failed attempts
 * retain them so retrying or refreshing can finish confirmation.
 */
export default function CheckoutConfirmationOverlay() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") !== "1") return;
    const sessionId = params.get("session_id");

    const stripParams = () => {
      params.delete("upgraded");
      params.delete("session_id");
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
    };

    if (!sessionId) {
      setError("Your checkout reference is missing. Please contact support to check your plan.");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout>;
    setConfirming(true);
    (async () => {
      try {
        const confirmation = await Promise.race([
          (async () => {
            const token = await getOrRefreshAccessToken();
            if (cancelled || controller.signal.aborted) return null;
            if (!token) {
              throw new Error("Please sign in with the account you used at checkout, then retry confirmation.");
            }
            const { data } = await axios.get(
              `${process.env.NEXT_PUBLIC_NGROX_URL}/billing/confirm-checkout`,
              {
                params: { session_id: sessionId },
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
                timeout: 20000,
              },
            );
            return (data?.data ?? data) as CheckoutConfirmation;
          })(),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => {
              reject(new Error("Confirmation is taking longer than expected. Please retry."));
              controller.abort();
            }, 20000);
          }),
        ]);
        if (cancelled) return;
        if (confirmation?.provisioned !== true) {
          setError("Your plan is not confirmed yet. Please retry in a moment.");
          return;
        }
        pushPurchaseConversion(sessionId, confirmation);
        stripParams();
        toast.success("You're all set. Welcome to your new plan.");
      } catch (failure) {
        if (!cancelled) {
          // Do not expose API payloads or checkout identifiers in the UI/logs.
          const message = failure instanceof Error && !axios.isAxiosError(failure)
            ? failure.message
            : "We couldn't confirm your plan. Please retry. This does not mean your payment failed.";
          setError(message);
        }
      } finally {
        clearTimeout(timeout!);
        if (!cancelled) setConfirming(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div role="alert" className="fixed bottom-6 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-amber-200 bg-white p-5 shadow-xl">
        <h2 className="font-semibold text-gray-900">We need to confirm your plan</h2>
        <p className="mt-2 text-sm text-gray-700">{error}</p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-[#4f39f6] px-4 py-2 text-sm font-medium text-white">
            Retry confirmation
          </button>
          <button type="button" onClick={() => setError(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
            Dismiss
          </button>
        </div>
      </div>
    );
  }
  if (!confirming) return null;
  return (
    <div role="status" className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
      <div aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-4 border-[#e3e7ff] border-t-[#4f39f6]" />
      <p className="text-sm font-medium text-gray-600">Setting up your new plan?</p>
    </div>
  );
}
