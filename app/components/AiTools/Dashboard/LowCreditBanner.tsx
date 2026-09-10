"use client";

import { useEffect, useState } from "react";
import {
  getTokenUsageSnapshot,
  refreshTokenUsageNow,
  subscribeTokenUsage,
} from "@/app/utils/tokenUsageClient";
import PricingPopup from "../PricingPopup";

/** Mount only on the dashboard. An unknown/error balance must never look exhausted. */
export default function LowCreditBanner() {
  const [usage, setUsage] = useState(getTokenUsageSnapshot);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = subscribeTokenUsage(setUsage);
    void refreshTokenUsageNow().catch(() => {});
    const timer = window.setInterval(() => {
      if (!document.hidden) void refreshTokenUsageNow().catch(() => {});
    }, 30000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);
  const remaining = usage.availableCredits;
  if (
    !usage.paidPlan ||
    remaining === null ||
    remaining > 10000 ||
    !usage.lastUpdatedAt
  )
    return null;
  return (
    <>
      <div
        role="status"
        className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
      >
        <p className="text-sm">
          {remaining === 0
            ? "Your credits are exhausted."
            : `Your credits are running low. You have ${remaining.toLocaleString()} remaining.`}
        </p>
        {remaining === 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-amber-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Renew now
          </button>
        )}
      </div>
      {open && <PricingPopup onClose={() => setOpen(false)} />}
    </>
  );
}
