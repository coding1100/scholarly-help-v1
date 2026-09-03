"use client";

import { useEffect, useState } from "react";
import PricingPopup from "./PricingPopup";

/**
 * Mounted once globally (see ClientScripts.tsx). Listens for the
 * "billing:free-run-limit-exceeded" window event, dispatched by the axios
 * interceptor when a signed-in user's free-run quota (free-run-quota.decorator.ts)
 * is exhausted on any tool. Opens the upgrade popup right there, the same way
 * GuestAuthGateModal opens for guests who run out of free clicks.
 */
export default function BillingGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onLimitExceeded = () => setOpen(true);
    window.addEventListener("billing:free-run-limit-exceeded", onLimitExceeded);
    return () => window.removeEventListener("billing:free-run-limit-exceeded", onLimitExceeded);
  }, []);

  if (!open) return null;
  return <PricingPopup onClose={() => setOpen(false)} />;
}
