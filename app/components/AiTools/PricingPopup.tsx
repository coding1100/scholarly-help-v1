"use client";
import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  billingRequest,
  billingError,
  BillingStatus,
  BillingOperation,
  PaidPlan,
  planName,
} from "@/app/utils/billingClient";

const plans: PaidPlan[] = ["starter", "starter_annual"];
const actionLabels: Record<string, string> = {
  subscribe: "Review subscription",
  renew: "Review early renewal",
  change_now: "Review plan change",
  schedule_change: "Review scheduled change",
  resume: "Resume payment",
};

export default function PricingPopup({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [selected, setSelected] = useState<PaidPlan>("starter");
  const [quote, setQuote] = useState<BillingOperation | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    billingRequest<BillingStatus>("status", undefined, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setStatus(data);
        setSelected(data.plan || "starter");
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(billingError(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [reload]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],[tabindex="0"]',
      );
      if (!elements?.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);

  const finish = (operation: BillingOperation) => {
    if (operation.status === "completed") {
      window.location.assign(operation.return_url);
      return;
    }
    if (operation.status === "payment_pending" && operation.url) {
      window.location.assign(operation.url);
      return;
    }
    setQuote(null);
    setReload((value) => value + 1);
    setError(
      operation.status === "review"
        ? "Your billing operation needs review. Please contact support."
        : operation.status === "expired"
          ? "The payment expired. You can review a new purchase."
          : "Your payment is being prepared. Check again in a moment.",
    );
  };
  const act = async () => {
    setBusy(true);
    setError(null);
    try {
      if (status?.pending_operation) {
        finish(
          await billingRequest<BillingOperation>(
            `operations/${status.pending_operation.operation_id}`,
          ),
        );
      } else if (quote) {
        finish(
          await billingRequest<BillingOperation>(
            `operations/${quote.operation_id}/confirm`,
            {},
          ),
        );
      } else {
        setQuote(
          await billingRequest<BillingOperation>("quote", {
            plan: selected,
            returnUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          }),
        );
      }
    } catch (e) {
      setError(billingError(e));
      // Keep a confirmed operation ID so an uncertain response can only resume that intent.
      if (quote) {
        try {
          finish(
            await billingRequest<BillingOperation>(
              `operations/${quote.operation_id}`,
            ),
          );
        } catch {
          /* Keep the existing quote and error for a safe retry. */
        }
      }
    } finally {
      setBusy(false);
    }
  };
  const manage = async () => {
    setBusy(true);
    setError(null);
    try {
      window.location.assign(
        (await billingRequest<{ url: string }>("portal", {})).url,
      );
    } catch (e) {
      setError(billingError(e));
      setBusy(false);
    }
  };
  const action = status?.actions[selected];
  const quoteAmount = quote
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: quote.currency,
      }).format(
        quote.amount /
          10 **
            (["ISK", "UGX", "HUF", "TWD"].includes(quote.currency.toUpperCase())
              ? 2
              : (new Intl.NumberFormat("en", {
                  style: "currency",
                  currency: quote.currency,
                }).resolvedOptions().maximumFractionDigits ?? 2)),
      )
    : "";
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="billing-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Manage your plan
            </h2>
            {status && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {planName(status.plan)}:{" "}
                {status.available_credits.toLocaleString()} credits available
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close billing"
            onClick={onClose}
            className="rounded p-2 text-gray-500"
          >
            <FiX size={20} />
          </button>
        </div>
        {busy && !status && (
          <p role="status" className="mt-5 text-sm">
            Loading your billing details...
          </p>
        )}
        {status?.scheduled_change && (
          <p className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-900">
            {planName(status.scheduled_change.plan)} starts{" "}
            {new Date(
              status.scheduled_change.effective_at * 1000,
            ).toLocaleDateString()}
            .
          </p>
        )}
        <div className="mt-5 grid grid-cols-1 gap-3">
          {plans.filter((plan) => plan !== "starter_annual").map((plan) => (
            <button
              type="button"
              key={plan}
              disabled={busy || !!status?.pending_operation}
              aria-pressed={selected === plan}
              onClick={() => {
                setSelected(plan);
                setQuote(null);
                setError(null);
              }}
              className={`rounded-xl border p-4 text-left ${selected === plan ? "border-primary-400 bg-primary-100 dark:bg-gray-800" : "border-gray-300"}`}
            >
              <span className="block font-semibold">
                {planName(plan)}
                {status?.plan === plan ? " (Current)" : ""}
              </span>
              <span className="mt-1 block text-lg">
                {plan === "starter" ? "$5 / month" : "$40 / year"}
              </span>
              <span className="mt-2 block text-xs">
                {plan === "starter"
                  ? "6,440,000 credits ($2 AI usage) and 5 scans per month"
                  : "32,200,000 credits ($10 AI usage) and 20 scans per year"}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
          Unused paid credits carry forward. Plagiarism scans reset each billing
          period.
        </p>
        {quote && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            <p className="font-semibold">
              {quote.action === "schedule_change"
                ? "New plan price"
                : "Payment"}
              : {quoteAmount}
            </p>
            <p className="mt-2">
              {quote.allocation.toLocaleString()} credits will be added after
              payment is confirmed.
            </p>
            {quote.action === "schedule_change" ? (
              <p className="mt-2">
                No charge today. Starts{" "}
                {new Date(quote.effective_at! * 1000).toLocaleDateString()}.
                Final renewal total may include applicable taxes or discounts.
              </p>
            ) : quote.resets_billing_date ? (
              <p className="mt-2">
                This starts a fresh{" "}
                {quote.plan === "starter" ? "month" : "year"} now and moves your
                next renewal date. No unused-time refund is applied. Your
                existing credits are retained.
              </p>
            ) : (
              <p className="mt-2">
                Renews automatically{" "}
                {quote.plan === "starter" ? "monthly" : "yearly"}. Review the
                final amount on Stripe before paying.
              </p>
            )}
          </div>
        )}
        {!quote && action?.message && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {action.message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {!status && !busy ? (
          <button
            type="button"
            onClick={() => setReload((v) => v + 1)}
            className="mt-4 rounded bg-primary-400 px-4 py-2 text-white"
          >
            Retry
          </button>
        ) : (
          <button
            type="button"
            disabled={
              busy ||
              !action?.action ||
              status?.review_required ||
              status?.pending_operation?.status === "review"
            }
            onClick={act}
            className="mt-5 w-full rounded-lg bg-primary-400 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy
              ? "Please wait..."
              : status?.pending_operation
                ? "Check or resume payment"
                : quote
                  ? quote.action === "schedule_change"
                    ? "Confirm scheduled change"
                    : "Confirm and continue to payment"
                  : actionLabels[action?.action || ""] || "Current plan"}
          </button>
        )}
        {status?.subscription_status && (
          <button
            type="button"
            disabled={busy}
            onClick={manage}
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Manage payment method or cancellation
          </button>
        )}
      </div>
    </div>
  );
}
