"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  formatUnixDate,
  getBillingStatus,
  getCreditUsage,
  getTokenUsage,
  openBillingPortal,
  startCheckout,
  PLAN_LABELS,
  type BillingStatus,
  type CreditUsageRow,
  type TokenUsage,
} from "@/app/utils/accountClient";

function resolvePortalUrl(result: unknown): string | null {
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && "url" in result) {
    const url = (result as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }
  return null;
}

export default function PlanCreditsTab() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [breakdown, setBreakdown] = useState<CreditUsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      // Settled, not all: the per-tool breakdown is a nice-to-have and must not
      // blank out the plan and credit figures if its aggregation fails.
      const [statusResult, usageResult, breakdownResult] =
        await Promise.allSettled([
          getBillingStatus(),
          getTokenUsage(),
          getCreditUsage(),
        ]);
      if (!active) return;

      if (statusResult.status === "fulfilled") setStatus(statusResult.value);
      if (usageResult.status === "fulfilled") setUsage(usageResult.value);
      if (breakdownResult.status === "fulfilled")
        setBreakdown(breakdownResult.value);

      if (statusResult.status === "rejected" && usageResult.status === "rejected") {
        setError("Could not load your plan right now.");
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const goToPortal = async () => {
    setBusy("portal");
    try {
      const url = resolvePortalUrl(await openBillingPortal());
      if (!url) throw new Error("No billing portal is available yet.");
      window.location.assign(url);
    } catch (err: any) {
      toast.error(err?.message || "Could not open billing.");
      setBusy(null);
    }
  };

  const goToCheckout = async (plan: "starter" | "starter_annual") => {
    setBusy(plan);
    try {
      const { url } = await startCheckout(plan);
      if (!url) throw new Error("Checkout is unavailable right now.");
      window.location.assign(url);
    } catch (err: any) {
      toast.error(err?.message || "Could not start checkout.");
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div aria-busy="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
        <div className="h-48 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
      </div>
    );
  }

  const isPaid = Boolean(status?.plan);
  const planLabel = status?.plan ? PLAN_LABELS[status.plan] || status.plan : "Free";
  const total = usage?.total_tokens ?? 0;
  const remaining = usage?.tokens_remaining ?? status?.available_credits ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0;
  const renewal = formatUnixDate(status?.next_billing_date ?? null);
  const maxCredits = breakdown.reduce((max, row) => Math.max(max, row.credits), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {error ? (
          <p role="alert" className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            {error}
          </p>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your plan</p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {planLabel}
              </h2>
              {status?.subscription_status ? (
                <span className="rounded-full bg-[#DCF2CE] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#2F7A00]">
                  {status.subscription_status}
                </span>
              ) : null}
            </div>
            {renewal ? (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Renews on {renewal}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={isPaid ? goToPortal : () => goToCheckout("starter")}
            disabled={busy !== null}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {isPaid ? "Change plan" : "Choose a plan"}
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Credits left this month
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <b className="text-gray-900 dark:text-gray-100">
                {remaining.toLocaleString()}
              </b>{" "}
              of {total.toLocaleString()}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Credits remaining"
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <div
              className="h-full rounded-full bg-primary-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {renewal ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Credits reset on {renewal}. Unused credits don&rsquo;t roll over.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => goToCheckout("starter")}
            disabled={busy !== null}
            className="rounded-xl bg-primary-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "starter" ? "Opening..." : "Buy more credits"}
          </button>
          {status?.plan !== "starter_annual" ? (
            <button
              type="button"
              onClick={() => goToCheckout("starter_annual")}
              disabled={busy !== null}
              className="rounded-xl bg-primary-200 px-5 py-2.5 text-sm font-bold text-primary-400 transition hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "starter_annual" ? "Opening..." : "Switch to yearly and save"}
            </button>
          ) : null}
        </div>
      </section>

      <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Where your credits went
        </h2>

        {breakdown.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {breakdown.map((row) => (
              <li key={row.service}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                    {row.service}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {row.credits.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-primary-400"
                    style={{
                      width: `${maxCredits > 0 ? Math.max(4, (row.credits / maxCredits) * 100) : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            No credits used this period yet.
          </p>
        )}

        <Link
          href="/tools/recent-work"
          className="mt-5 inline-block text-sm font-semibold text-primary-400 underline-offset-4 hover:underline"
        >
          See full usage history
        </Link>
      </section>
    </div>
  );
}
