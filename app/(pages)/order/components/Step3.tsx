"use client";

import { FC, useEffect, useState } from "react";
import Button from "@/app/components/Button/Button";
import { formatDateWithTime } from "@/app/components/PriceCalculator/helper";
import StripeCheckoutForm from "./StripeEelementsProvider";
import moment from "moment";

interface Step3Props {
  price: any;
}
const Step3: FC<Step3Props> = ({ price }) => {
  // const apiPayload = JSON.parse(localStorage.getItem("apiPayload"));
  const storedApiPayload = localStorage.getItem("apiPayload");
  const apiPayload = storedApiPayload ? JSON.parse(storedApiPayload) : null;
  return (
    <div className="my-5">
      <div className="md:grid md:grid-cols-2 md:gap-5 md:items-center md:flex-none flex flex-col-reverse">
        <div className="mt-4">
          {" "}
          <StripeCheckoutForm price={price} />{" "}
        </div>
        <div>
          <div className="bg-primary-400 text-white py-6 px-5">
            <div className="">
              <h3 className="text-3xl font-semibold">Summary</h3>
              <div className="border border-transparent border-t-[3px] border-t-[#6467e0] my-4"></div>

              <div className="grid grid-cols-2 text-sm font-light">
                <div>Order</div>
                <div>#405614389</div>
              </div>
              <div className="grid grid-cols-2 mt-2 text-sm font-light">
                <div>Biography:</div>
                <div>${price}</div>
              </div>

              <div className="mt-2 text-sm font-light">
                <div className="mr-2">Details:</div>
                <div>
                  {apiPayload?.academicLevel}, {apiPayload?.qty} Page, By{" "}
                  {formatDateWithTime(moment(apiPayload?.date))}
                </div>
              </div>

              <div className="border border-transparent border-t-[3px] border-t-[#6467e0] my-4"></div>

              <div className="flex justify-between">
                <div className="font-bold text-2xl">TOTAL</div>
                <div className="font-bold text-2xl">${price}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;
