"use client";

import React from "react";
import { FiCheck, FiZap } from "react-icons/fi";
import { PiSealCheckFill } from "react-icons/pi";
import axios from "axios";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

type PackageType = "starter" | "starter_annual";

interface PricingPlan {
  key: PackageType;
  name: string;
  price: string;
  duration: string;
  badge?: string;
  detail: string;
  perks: string[];
}

const plans: PricingPlan[] = [
  {
    key: "starter_annual",
    name: "Starter Annual",
    price: "$40",
    duration: "/year",
    badge: "Best value",
    detail: "Two months free compared to paying monthly",
    perks: ["Around $10 of AI tool usage every year", "20 plagiarism scans a year"],
  },
  {
    key: "starter",
    name: "Starter",
    price: "$5",
    duration: "/month",
    detail: "Flexible, cancel whenever you like",
    perks: ["Around $2 of AI tool usage every month", "5 plagiarism scans a month"],
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/v1/billing/create-checkout`,
        { plan: selectedPlan },
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.18s_ease-out]"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_-12px_rgba(79,57,246,0.35)] animate-[popIn_0.22s_cubic-bezier(0.16,1,0.3,1)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 backdrop-blur transition hover:bg-gray-100 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#4f39f6] via-[#5b46f8] to-[#7a5cf9] px-6 pb-7 pt-8 text-white sm:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            <FiZap className="h-4 w-4" />
            You&apos;ve reached your free runs
          </div>
          <h2 className="mt-2 text-2xl font-bold leading-snug sm:text-[28px]">
            Keep the momentum going
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-white/85">
            Unlock every tool on ScholarlyHelp and never lose your flow to a limit again.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {/* Plan picker */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {plans.map((plan) => {
              const active = selectedPlan === plan.key;
              return (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                    active
                      ? "border-[#4f39f6] bg-[#f5f3ff] shadow-[0_6px_18px_-6px_rgba(79,57,246,0.35)]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-[#008236] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                    {active && <PiSealCheckFill className="h-5 w-5 text-[#4f39f6]" />}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xs font-medium text-gray-500">{plan.duration}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{plan.detail}</p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <FiCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4f39f6]" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Shared features */}
          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Included in every plan
            </p>
            <ul className="space-y-1.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4f39f6]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f39f6] py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(79,57,246,0.55)] transition-all hover:bg-[#432dd7] hover:shadow-[0_12px_28px_-6px_rgba(79,57,246,0.6)] disabled:cursor-not-allowed disabled:opacity-70"
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
              <>
                Continue with {plans.find((p) => p.key === selectedPlan)?.name}
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            Secure checkout with Stripe. Cancel whenever you want, no questions asked.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPopup;
