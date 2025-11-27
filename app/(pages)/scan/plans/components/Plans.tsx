"use client";

import axiosInstance from "@/app/axios";
import { notification } from "@/app/utilities/utilities";
import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { twMerge } from "tailwind-merge";
import PaymentErrDialog from "./PaymentErrDialog";

type Plan = {
  _id: string;
  type: string;
  duration: string;
  priceId: string;
  priceInDollars: number;
};

const Plans = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [buyingPlan, setBuyingPlan] = useState<string>("");

  useEffect(() => {
    getPlans();
    if (window.location?.href.includes("?session_id")) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => setOpen(false);

  const getPlans = async () => {
    try {
      const res = await axiosInstance.get(
        "/scan-to-solve/user/payment/package"
      );
      setPlans(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (buyingPlan) return;
    setBuyingPlan(plan._id);

    try {
      const res = await axiosInstance.post(
        `/scan-to-solve/user/payment/checkout?priceId=${plan.priceId}`
      );

      window.location.href = res.data.url;
    } catch (error) {
      // @ts-ignore
      notification("error", error?.response?.data?.message);
      setBuyingPlan("");
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-0">
      <div className="min-h-[470px]">
        <div className="text-[#7A7A7A] text-2xl font-bold text-center">
          Choose Your <span className="text-[#ff3449]">Plan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-10">
          {isLoading ? (
            <div className="text-center col-span-3">
              <ClipLoader color="#ff3449" />
            </div>
          ) : (
            plans.map((plan, i) => (
              <div
                className="bg-[#ff3449] text-white text-center py-14"
                key={plan._id}
              >
                <div className="text-2xl font-semibold">
                  {plan.type} Subscription
                </div>
                <div className="font-bold text-2xl mt-4">
                  ${plan.priceInDollars}/{plan.duration}
                </div>
                <div className="text-sm mt-10">
                  Solution to unlimited number of questions
                </div>
                <button
                  className={twMerge(
                    "bg-white text-[#FF3449] min-w-[200px] rounded font-semibold text-sm p-2 mt-10",
                    buyingPlan === plan._id && "bg-gray-300 cursor-not-allowed"
                  )}
                  onClick={() => handleSubscribe(plan)}
                >
                  {buyingPlan === plan._id ? (
                    <ClipLoader color="#ff3449" size={16} />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <PaymentErrDialog handleClose={handleClose} open={open} />
    </div>
  );
};

export default Plans;
