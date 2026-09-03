"use client";

import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import axios from "axios";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

type PackageType = "starter" | "starter_annual";

interface PricingPlan {
  key: PackageType;
  name: string;
  price: string;
  duration: string;
  badge?: string;
  perks: string[];
}

const plans: PricingPlan[] = [
  {
    key: "starter_annual",
    name: "Starter Annual",
    price: "$40",
    duration: "/year",
    badge: "Best value",
    perks: ["32,200,000 tokens a year", "20 plagiarism scans a year"],
  },
  {
    key: "starter",
    name: "Starter",
    price: "$5",
    duration: "/month",
    perks: ["6,440,000 tokens a month", "5 plagiarism scans a month"],
  },
];

const features = [
  "Every AI tool, unlocked",
  "Full length document scans, up to 10,000 words",
  "Priority access to new tools as they launch",
];

const PricingPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = React.useState<PackageType>("starter_annual");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const authToken = await getOrRefreshAccessToken();
      if (!authToken) {
        setErrorMessage("Please sign in again to continue.");
        return;
      }
      // Sends the user back to the exact tool page they were on (draft
      // restored there via useBillingDraftStash + useToolDraftPersistence)
      // instead of a generic success page.
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : undefined;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/billing/create-checkout`,
        { plan: selectedPlan, returnUrl },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      // Backend wraps responses as { success, message, data }
      const responseData = response?.data?.data ?? response?.data;
      const redirectTo = responseData?.url;
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        setErrorMessage("We could not start checkout. Please try again in a moment.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong starting checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:p-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-400">
              You&apos;ve used your free runs
            </p>
            <h2 className="mt-1 text-xl font-semibold text-primary-500 dark:text-gray-100">
              Upgrade to keep going
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
        </div>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Unlock every AI tool with no interruptions.
        </p>

        {/* Plan picker */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const active = selectedPlan === plan.key;
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className={`relative flex flex-col items-start rounded-md border p-4 text-left transition-colors ${
                  active
                    ? "border-primary-400 bg-primary-100"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-secondary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {plan.badge}
                  </span>
                )}
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {plan.name}
                  </span>
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      active ? "border-primary-400 bg-primary-400" : "border-gray-300"
                    }`}
                  >
                    {active && <FiCheck className="h-3 w-3 text-white" />}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.duration}
                  </span>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300"
                    >
                      <FiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-400" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Shared features */}
        <div className="mt-4 rounded-md bg-gray-50 p-3.5 dark:bg-gray-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Included in every plan
          </p>
          <ul className="space-y-1.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary-500/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Taking you to checkout
            </>
          ) : (
            <>Continue with {plans.find((p) => p.key === selectedPlan)?.name}</>
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          Secure checkout with Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default PricingPopup;
