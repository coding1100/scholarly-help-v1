"use client";

import { FC, useState } from "react";
import "./index.css";
import { steps } from "./contentSteps";
import TimeLine from "./TimeLine";
import Button from "@/app/components/Button/Button";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import { useAuthContext } from "@/app/context/auth/AuthContext";

interface OrderProps {}
const Order: FC<OrderProps> = ({}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [price, setPrice] = useState(0);
  const { state } = useAuthContext();
  return (
    <div className="sm:container sm:mx-auto mx-6 pt-5">
      <TimeLine activeStep={activeStep} setActiveStep={setActiveStep} />
      {activeStep === 1 && <Step1 price={price} setPrice={setPrice} />}
      {activeStep === 2 && <Step2 setActiveStep={setActiveStep} />}
      {activeStep === 3 && (
        <div>
          {!state.user.email ? (
            <div className="text-primary-400 text-xl my-6 font-bold text-center">
              Must Login/Sign-up first in step 2
            </div>
          ) : (
            <Step3 price={price} />
          )}
        </div>
      )}

      <div
        className={`my-5 grid grid-cols-2 ${activeStep !== 1 ? "hidden" : ""}`}
      >
        <div className="col-span-1 flex justify-center">
          <Button
            className="w-56 border border-[#0b5ed7] bg-primary-400 hover:text-white hover:bg-[#0b5ed7]"
            onClick={() => setActiveStep(2)}
          >
            NEXT STEP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Order;
