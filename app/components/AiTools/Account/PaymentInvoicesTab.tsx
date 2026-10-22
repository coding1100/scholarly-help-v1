"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  formatMoney,
  formatUnixDate,
  getInvoices,
  getPaymentMethods,
  openBillingPortal,
  type Invoice,
  type PaymentMethod,
} from "@/app/utils/accountClient";

function resolvePortalUrl(result: unknown): string | null {
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && "url" in result) {
    const url = (result as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }
  return null;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-[#DCF2CE] text-[#2F7A00]",
  open: "bg-secondary-200 text-secondary-500",
  void: "bg-gray-200 text-gray-600",
  uncollectible: "bg-gray-200 text-gray-600",
};

export default function PaymentInvoicesTab() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [methodResult, invoiceResult] = await Promise.allSettled([
        getPaymentMethods(),
        getInvoices(),
      ]);
      if (!active) return;
      if (methodResult.status === "fulfilled") setMethods(methodResult.value);
      if (invoiceResult.status === "fulfilled") setInvoices(invoiceResult.value);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  /**
   * Every write to a card, and cancellation, goes through the Stripe-hosted
   * portal. Card details must never reach our own form.
   */
  const goToPortal = async () => {
    setBusy(true);
    try {
      const url = resolvePortalUrl(await openBillingPortal());
      if (!url) throw new Error("No billing account found yet.");
      window.location.assign(url);
    } catch (err: any) {
      toast.error(err?.message || "Could not open billing.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div
        aria-busy="true"
        className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      />
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Payment &amp; invoices
      </h2>

      {methods.length > 0 ? (
        methods.map((method) => (
          <div
            key={method.id}
            className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-9 w-14 items-center justify-center rounded-md bg-gray-900 text-[11px] font-bold uppercase tracking-wide text-white">
                {method.brand}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}{" "}
                  ending {method.last4}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {method.exp_month && method.exp_year
                    ? `Expires ${String(method.exp_month).padStart(2, "0")}/${String(method.exp_year).slice(-2)}`
                    : "Card on file"}
                  {method.is_default ? " · Default" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPortal}
                disabled={busy}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-primary-300 hover:bg-primary-100 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                Update card
              </button>
              <button
                type="button"
                onClick={goToPortal}
                disabled={busy}
                className="text-sm font-bold text-primary-400 underline-offset-4 hover:underline disabled:opacity-60"
              >
                + Add method
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No payment method saved yet.
          </p>
          <button
            type="button"
            onClick={goToPortal}
            disabled={busy}
            className="mt-3 text-sm font-bold text-primary-400 underline-offset-4 hover:underline disabled:opacity-60"
          >
            + Add method
          </button>
        </div>
      )}

      {invoices.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {["Date", "Description", "Amount", "Status", "Invoice"].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      scope="col"
                      className={`py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 ${index === 4 ? "text-right" : ""}`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-700"
                >
                  <td className="py-4 text-sm text-gray-900 dark:text-gray-100">
                    {formatUnixDate(invoice.created)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-900 dark:text-gray-100">
                    {invoice.description}
                  </td>
                  <td className="py-4 text-sm text-gray-900 dark:text-gray-100">
                    {formatMoney(
                      invoice.amount_paid || invoice.amount_due,
                      invoice.currency,
                    )}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        STATUS_STYLES[invoice.status || ""] ||
                        "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {invoice.status || "unknown"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {invoice.pdf_url || invoice.invoice_url ? (
                      <a
                        href={(invoice.pdf_url || invoice.invoice_url) as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary-400 underline-offset-4 hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          No invoices yet.
        </p>
      )}

      <button
        type="button"
        onClick={goToPortal}
        disabled={busy}
        className="mt-6 text-sm text-gray-600 underline-offset-4 transition hover:text-gray-900 hover:underline disabled:opacity-60 dark:text-gray-400 dark:hover:text-gray-100"
      >
        Cancel subscription
      </button>
    </section>
  );
}
