"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LuZap } from "react-icons/lu";
import PricingPopup from "./PricingPopup";
import { appendQueryString } from "@/app/utils/url";
import { __TOOLS_SHEET_EVENT_NAME__ } from "@/app/utils/toolsSheetClient";
import {
  getTokenUsageSnapshot,
  initTokenUsageAutoRefresh,
  refreshTokenUsageNow,
  requestTokenUsageRefresh,
  subscribeTokenUsage,
  __TOKEN_USAGE_UNAUTHORIZED_EVENT__,
} from "@/app/utils/tokenUsageClient";

interface UsageAndPricingProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const UsageAndPricing: React.FC<UsageAndPricingProps> = ({ setFlag, flag }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentQs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";

  const [showPricing, setShowPricing] = useState(false);
  const [totalTokens, setTotalTokens] = useState<number>(
    getTokenUsageSnapshot().totalTokens,
  );
  const [usedTokens, setUsedTokens] = useState<number>(
    getTokenUsageSnapshot().usedTokens,
  );
  let accessToken: string | null = null;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
  }

  // Calculate usage percentage with proper fallbacks
  const usagePercentage =
    totalTokens > 0 ? Math.min((usedTokens / totalTokens) * 100, 100) : 0;

  const redirectToSignIn = useCallback(() => {
    const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
    router.push(
      appendQueryString(
        signInBase,
        `returnUrl=${encodeURIComponent(pathname || "/tools/dashboard")}`,
      ),
    );
  }, [currentQs, pathname, router]);

  useEffect(() => {
    initTokenUsageAutoRefresh(__TOOLS_SHEET_EVENT_NAME__);
    const onUnauthorized = () => redirectToSignIn();
    window.addEventListener(__TOKEN_USAGE_UNAUTHORIZED_EVENT__, onUnauthorized);
    const unsub = subscribeTokenUsage((snap) => {
      setTotalTokens(snap.totalTokens);
      setUsedTokens(snap.usedTokens);
    });
    // initial fetch on mount
    void refreshTokenUsageNow().catch((e: any) => {
      if (e?.status === 401) redirectToSignIn();
    });
    return () => {
      window.removeEventListener(
        __TOKEN_USAGE_UNAUTHORIZED_EVENT__,
        onUnauthorized,
      );
      unsub();
    };
  }, [redirectToSignIn]);

  useEffect(() => {
    if (!flag) return;
    // Backwards-compatible trigger from tools that set `flag`
    requestTokenUsageRefresh(0);
  }, [flag]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Token Limit Section */}
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Token limit</span>
          <span className="text-gray-500">
            {usedTokens.toLocaleString()}/{totalTokens.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-400"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* See Pricing Button */}
      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff641a] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#ff641a]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={() => setShowPricing(true)}
      >
        <LuZap className="h-4 w-4 bg-transparent" />
        See Pricing
      </button>

      {showPricing && <PricingPopup onClose={() => setShowPricing(false)} />}
    </div>
  );
};

export default UsageAndPricing;
