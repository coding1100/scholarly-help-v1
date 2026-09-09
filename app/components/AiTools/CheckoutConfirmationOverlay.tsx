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
 * `value`/`currency`/`plan` come straight from the backend's confirm-checkout
 * response (amount_total/currency/plan on WebhookService.confirmCheckoutSession
 * — Stripe's own values off the Checkout Session, amount in the smallest
 * currency unit e.g. cents). If that call fails or returns an older shape
 * without these fields, they're simply omitted from the push rather than
 * blocking the event.
 * Ads Manager: build the Google Ads / Meta conversion tags in GTM off this
 * "tool_purchase" dataLayer event (named to avoid colliding with an existing
 * "purchase" event already used elsewhere in GTM) — no further app code
 * changes needed for that.
 */
function pushPurchaseConversion(sessionId: string, confirmData: any) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "tool_purchase",
    transaction_id: sessionId,
    value: confirmData?.amount_total ?? confirmData?.value ?? undefined,
    currency: confirmData?.currency ?? undefined,
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
 * Strips both query params once done, success or not, so a page refresh
 * never repeats this.
 */
export default function CheckoutConfirmationOverlay() {
  const [confirming, setConfirming] = useState(false);

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
      // No session id to confirm with (e.g. an older link) — fall back to
      // trusting the webhook, same as before this overlay existed. There is
      // nothing here to key a dataLayer conversion event to, so none fires.
      toast.success("You're all set. Welcome to your new plan.");
      stripParams();
      return;
    }

    let cancelled = false;
    setConfirming(true);
    (async () => {
      try {
        const token = await getOrRefreshAccessToken();
        if (!token) return; // Not signed in on this tab — nothing we can confirm.
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/billing/confirm-checkout`,
          {
            params: { session_id: sessionId },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        pushPurchaseConversion(sessionId, data?.data ?? data);
      } catch {
        // Best-effort: the invoice.paid webhook is still the system of
        // record and will provision this shortly regardless. Deliberately no
        // conversion event here — this request failing doesn't mean the
        // payment failed, but firing on an unconfirmed session risks a false
        // conversion, and the webhook path has no client-side hook to fire from.
      } finally {
        if (!cancelled) {
          toast.success("You're all set. Welcome to your new plan.");
          stripParams();
          setConfirming(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!confirming) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e3e7ff] border-t-[#4f39f6]" />
      <p className="text-sm font-medium text-gray-600">Setting up your new plan…</p>
    </div>
  );
}
