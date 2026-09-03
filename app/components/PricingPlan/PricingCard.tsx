"use client";

import axios from "axios";
import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoCheckmarkSharp, IoChevronDownOutline } from "react-icons/io5";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

interface PricingCardProps {
  item: {
    plan: string;
    /** "starter" | "starter_annual" | "none". "none" is the Free plan and never hits checkout. */
    submitPlan: string;
    subTitle: string;
    price: string;
    duration: string;
    button: string;
    FeatureHeading: string;
    Features: string[];
  };
  index: number;
}

const PricingCard: FC<PricingCardProps> = ({ item, index }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async () => {
    if (item.submitPlan === "none") {
      router.push("/sign-up");
      return;
    }
    setIsLoading(true);
    try {
      const token = await getOrRefreshAccessToken();
      if (!token) {
        router.push(`/sign-in?returnUrl=/pricing`);
        return;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/billing/create-checkout`,
        { plan: item.submitPlan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = response?.data?.data ?? response?.data;
      const redirectTo = responseData?.url;
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        toast.error("Could not start checkout. Please try again.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Could not start checkout. Please try again.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setIsLoading(false);
    }
  };
  const isFeatured = index === 3;
  return (
    <div
      className={`w-full transition-transform duration-200 ${
        isFeatured
          ? "border-2 border-primary-400 shadow-lg scale-[1.02]"
          : "border hover:shadow-md"
      } rounded-2xl overflow-hidden`}
      style={{ boxShadow: isFeatured ? undefined : "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}
    >
      {isFeatured && (
        <div className="w-full py-2 bg-primary-400 text-center text-white text-xs font-semibold tracking-wide">
          <p>Best value, two months free</p>
        </div>
      )}
      <div className="py-4 px-6 ">
        <p className="text-2xl text-center mb-3">{item.plan}</p>
        <p className="text-sm text-[#626f86] text-center mb-2">
          {item.subTitle}
        </p>
        <p className="text-center text-[#172b4d] text-[28px] leading-7">
          {item.price} <span className="text-base">USD</span>
        </p>
        <p className="text-xs text-[#626f86] text-center mb-4">
          {item.duration}
        </p>
        <div className="w-full flex justify-center mb-9">
          <button
            onClick={handleSelect}
            disabled={isLoading}
            className={`w-[80%] transition-colors duration-150 ${
              isFeatured
                ? "bg-primary-400 text-white hover:bg-primary-500"
                : "bg-white text-primary-400 hover:bg-primary-50"
            } border border-primary-400 rounded-full py-2 px-5 disabled:opacity-60`}
          >
            {isLoading ? "Redirecting…" : item.button}
          </button>
        </div>
        <p className="text-base font-semibold text-[#172b4d] mb-8">
          {item.FeatureHeading}
        </p>
        <div className="space-y-6">
          {item.Features.map((feature, index) => (
            <div key={index} className="flex justify-start items-center gap-3">
              <IoCheckmarkSharp color="#008847" />
              <p>{feature}</p>
            </div>
          ))}
        </div>
        {index !== 1 && (
          <div className="py-2 px-5 mt-5 mb- w-fit bg-white hover:bg-primary-200 transition-colors duration-300 text-sm text-primary-400 flex justify-center items-center gap-2 rounded-full cursor-pointer">
            <p>And much more</p> <IoChevronDownOutline />
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
