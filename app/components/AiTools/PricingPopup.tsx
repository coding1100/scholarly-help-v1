"use client";
import { useEffect, useRef, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import {
  billingRequest,
  billingError,
  BillingStatus,
  BillingOperation,
  PaidPlan,
  planName,
} from "@/app/utils/billingClient";
import {
  EXPERT_WHATSAPP_HREF,
  trackExpertWhatsAppClick,
} from "@/app/components/AiTools/Dashboard/ExpertHelpCard";

const plans: PaidPlan[] = ["starter", "starter_annual"];
const actionLabels: Record<string, string> = {
  subscribe: "Review subscription",
  renew: "Review early renewal",
  change_now: "Review plan change",
  schedule_change: "Review scheduled change",
  resume: "Resume payment",
};

interface PricingPopupProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function PricingPopup({
  onClose,
  title = "You've used your free credits",
  subtitle = "Unlock all 16 tools for $5/month.",
}: PricingPopupProps) {
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
        const quoteOp = await billingRequest<BillingOperation>("quote", {
          plan: selected,
          returnUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        });
        finish(
          await billingRequest<BillingOperation>(
            `operations/${quoteOp.operation_id}/confirm`,
            {},
          ),
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
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-popup-title"
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="billing-popup-title"
              className="text-[22px] font-bold tracking-tight text-gray-950 dark:text-white"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close billing"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Full Access Plan Card */}
        <div className="mt-5 rounded-2xl border-2 border-[#5B4DFB]/40 bg-[#F8F9FE] p-5 dark:border-indigo-500/30 dark:bg-gray-800/60">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-950 dark:text-white">
                Full Access
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                All 16 tools, one plan
              </p>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                $5
              </span>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                / month
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <FiCheck className="h-4 w-4 shrink-0 text-[#5B4DFB] stroke-[3]" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                Unlimited use on all 16 tools
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FiCheck className="h-4 w-4 shrink-0 text-[#5B4DFB] stroke-[3]" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                Longer texts and full results
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FiCheck className="h-4 w-4 shrink-0 text-[#5B4DFB] stroke-[3]" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                5 plagiarism scans every month
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FiCheck className="h-4 w-4 shrink-0 text-[#5B4DFB] stroke-[3]" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                Cancel anytime
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Originality", "Study Lab", "Writer Lab", "+ more"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200/80 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          disabled={busy}
          onClick={act}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#5B4DFB] py-3.5 px-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(91,77,251,0.3)] transition hover:bg-[#4E3FF0] active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Please wait..." : "Continue for $5/month"}
        </button>

        {/* Secure Checkout / Fair Use */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure checkout · Unlimited use is subject to fair use</span>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          <span className="absolute bg-white px-2.5 text-xs text-gray-400 dark:bg-gray-900">
            or
          </span>
        </div>

        {/* Short on time? / Done-For-You */}
        <div className="rounded-2xl border border-[#BFE3A8] bg-[#F2FAEC] p-4 sm:p-5 dark:border-[#41A800]/30 dark:bg-[#41A800]/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-950 dark:text-white">
              Short on time?
            </span>
            <span className="rounded-full bg-[#DCF2CE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2F7A00] dark:bg-[#41A800]/20 dark:text-[#9BD97A]">
              Done-for-you
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            An expert can take the whole assignment off your plate.
          </p>

          <a
            href={EXPERT_WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExpertWhatsAppClick("free_credit_limit_popup")}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F7A33] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-[0_4px_12px_rgba(31,122,51,0.25)] transition hover:bg-[#186127]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
            >
              <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7c1.7.9 3.6 1.4 5.6 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3ZM12 21.5c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 1 1 8.4 4.7Zm5.3-7.1c-.3-.1-1.7-.850-2-.95-.3-.1-.5-.1-.7.15-.2.3-.75.95-.9 1.15-.2.2-.35.2-.65.05-1.75-.85-2.9-1.55-4.05-3.5-.3-.55.3-.5.9-1.65.1-.2.05-.35 0-.5s-.7-1.6-.9-2.2c-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.5.05-.8.35-.3.3-1.05 1-1.05 2.5s1.1 2.9 1.25 3.1c.15.2 2.15 3.3 5.2 4.6 2 .85 2.75.95 3.75.8.6-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.05-.1-.25-.2-.55-.3Z" />
            </svg>
            Get a quote on WhatsApp
          </a>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            <span>{error}</span>
            {error.toLowerCase().includes("sign in") && (
              <a
                href={`/sign-in?returnUrl=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.pathname + window.location.search
                    : "/tools",
                )}`}
                className="ml-2 shrink-0 font-semibold underline text-red-800 hover:text-red-900 dark:text-red-200"
              >
                Sign in
              </a>
            )}
          </div>
        )}

        {/* Existing subscriber management link */}
        {status?.subscription_status && (
          <button
            type="button"
            disabled={busy}
            onClick={manage}
            className="mt-3 w-full text-center text-xs text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Manage payment method or cancellation
          </button>
        )}
      </div>
    </div>
  );
}
