"use client";

import axios from "axios";
import { FC } from "react";
import { IoCheckmarkSharp, IoChevronDownOutline } from "react-icons/io5";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

interface PricingCardProps {
  item: {
    plan: string;
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

// plans should be quarterly, monthly, yearl

const PricingCard: FC<PricingCardProps> = ({ item, index }) => {
  const handleStripe = async (submitplan: string) => {
    try {
      const token = await getOrRefreshAccessToken();
      if (!token) throw new Error("Sign in before selecting a plan");
      const payload = { plan: submitplan };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/v1/billing/create-checkout`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const redirectTo = response?.data?.url;
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      // Handle error as needed
      console.error("Stripe checkout error:", error);
    }
  };
  return (
    <div
      className={`w-full ${
        index === 2 ? "border border-primary-400" : "border"
      } rounded-2xl overflow-hidden`}
      style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}
    >
      {index === 2 && (
        <div className="w-full py-2 bg-primary-400 text-center text-white text-xs">
          <p>Most popular</p>
        </div>
      )}
      <div className="py-4 px-6 ">
        <p className="text-2xl text-center mb-3">{item.plan}</p>
        <p className="text-sm text-[#626f86] text-center mb-2">
          {item.subTitle}
        </p>
        <p className="text-center text-[#172b4d] text-[28px] leading-7">
          {item.price} {index !== 3 && <span className="text-base">USD</span>}
        </p>
        <p className="text-xs text-[#626f86] text-center mb-4">
          {item.duration}
        </p>
        <div className="w-full flex justify-center mb-9">
          <button
            onClick={() => handleStripe(item.submitPlan)}
            className={`w-[80%] ${
              index === 2
                ? "bg-primary-400 text-white"
                : "bg-white text-primary-400"
            }  border border-primary-400 rounded-full py-2 px-5`}
          >
            {item.button}
          </button>
        </div>
        {/* <p className="text-xs font-semibold text-[#2c3e5d] text-center">
        No credit card required
      </p> */}
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
