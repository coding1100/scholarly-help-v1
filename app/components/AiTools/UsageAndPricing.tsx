"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuZap } from "react-icons/lu";
import PricingPopup from "./PricingPopup";
import axios from "axios";
import { appendQueryString } from "@/app/utils/url";

interface UsageAndPricingProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const UsageAndPricing: React.FC<UsageAndPricingProps> = ({ setFlag, flag }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user_id =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const [showPricing, setShowPricing] = useState(false);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [usedTokens, setUsedTokens] = useState<number>(0);
  let accessToken: string | null = null;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
  }

  // Calculate usage percentage with proper fallbacks
  const usagePercentage =
    totalTokens > 0 ? Math.min((usedTokens / totalTokens) * 100, 100) : 0;

  useEffect(() => {
    fetchTokenUsage();
  }, []);
  useEffect(() => {
    fetchTokenUsage();
  }, [flag]);

  const fetchTokenUsage = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/users/token-usage`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("✅ Token usage response:", response.data);
      setTotalTokens(response.data.total_tokens);
      setUsedTokens(response.data.usedTokens);
      localStorage.setItem("totalTokens", response.data.total_tokens);

      setFlag(false);
      return;
    } catch (error: any) {
      console.error("❌ Error fetching token usage:", error);
      console.error("❌ Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
      });

      // Handle unauthorized (401) - redirect to /login
      if (error?.response?.status === 401) {
        console.log("🔄 Unauthorized - redirecting to /login");
        const currentQs = searchParams?.toString();
        const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
        router.push(
          appendQueryString(
            signInBase,
            `returnUrl=${encodeURIComponent(pathname || "/tools/dashboard")}`,
          ),
        );
        return;
      }

      // Production-level fallback: Set default token values for Google OAuth users
      if (
        error?.code === "ERR_NETWORK" ||
        error?.code === "ERR_CONNECTION_REFUSED"
      ) {
        console.log(
          "🔄 Backend unavailable, using default token values for Google OAuth"
        );
        const defaultTokens = 1000000; // Default free tier tokens
        setTotalTokens(defaultTokens);
        setUsedTokens(0);
        localStorage.setItem("totalTokens", defaultTokens.toString());
        setFlag(false);
        return;
      }

      throw error;
    }
  };

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
