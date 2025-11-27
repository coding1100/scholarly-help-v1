"use client";

import axiosInstance from "@/app/axios";
import { FC } from "react";
import { IoCheckmarkSharp, IoChevronDownOutline } from "react-icons/io5";

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
      const user_id = "f0920ed7-2d98-4fd9-a872-863a4b8bad20";
      const token =
        "eyJhbGciOiJIUzI1NiIsImtpZCI6ImlaYzAya0laelFDSmhhRXciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2l0eW12aXR4amFucGFobGx2c2liLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmMDkyMGVkNy0yZDk4LTRmZDktYTg3Mi04NjNhNGI4YmFkMjAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzNzk0MDU3LCJpYXQiOjE3NTM3OTA0NTcsImVtYWlsIjoibWFsaWt1bWFpcjQ0ODI2QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYWxpa3VtYWlyNDQ4MjZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic2lnbnVwX2NvbXBsZXRlZCI6ZmFsc2UsInN1YiI6ImYwOTIwZWQ3LTJkOTgtNGZkOS1hODcyLTg2M2E0YjhiYWQyMCIsInRlbXBfdXNlcl9kYXRhIjoie1wiZW1haWxcIjpcIm1hbGlrdW1haXI0NDgyNkBnbWFpbC5jb21cIixcIm5hbWVcIjpcIlVtYWlyIE1hbGlrXCJ9In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM3OTA0NTd9XSwic2Vzc2lvbl9pZCI6IjU2YmJhNzQzLWQyOTAtNDk5YS1hNjc4LThiNjkwNjkzYTQ3ZSIsImlzX2Fub255bW91cyI6ZmFsc2V9.wVmAskdxlqPems_r_krzhTv3tGAa7pjsPxbWQd3mtKI";

      const payload = {
        user_id,
        plan: submitplan,
      };

      const response = await axiosInstance.post(
        "https://c8e28868a478.ngrok-free.app/v1/billing/create-checkout",
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
