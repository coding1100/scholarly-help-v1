"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

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
      // trusting the webhook, same as before this overlay existed.
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
        await axios.get(`${process.env.NEXT_PUBLIC_NGROX_URL}/billing/confirm-checkout`, {
          params: { session_id: sessionId },
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best-effort: the invoice.paid webhook is still the system of
        // record and will provision this shortly regardless.
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
