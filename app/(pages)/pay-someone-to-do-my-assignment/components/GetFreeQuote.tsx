"use client";

import Dots from "@/app/assets/Icons/Dots";
import LeftEclips from "@/app/assets/Icons/LeftEclips";
import SpiralArrow from "@/app/assets/Icons/SpiralArrow";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import studentsImg from "@/app/assets/Images/students_image.png";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { usePathname } from "next/navigation";

export type ApiPayload = {
  url: string;
  course_name: string;
  course_level: string;
  course_weeks: string;
  course_deadline: string | null;
  instructions?: string;
  file: string;
  noOfPages: string;
  email?: string;
};

const initialApiPayload: ApiPayload = {
  url: "",
  course_name: "",
  course_level: "",
  course_weeks: "",
  course_deadline: null,
  instructions: "",
  file: "",
  noOfPages: "",
  email: "",
};

interface GetFreeQuoteProps {}
const GetFreeQuote: FC<GetFreeQuoteProps> = ({}) => {
  const [apiPayload, setApiPayload] = useState<ApiPayload>(initialApiPayload);
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentPage = usePathname();
  useEffect(() => {
    setApiPayload({
      ...apiPayload,
      url: currentPage,
    });
  }, []);

  
  return (
    <div>
      <div className="bg-[#e4e4fa] relative pt-10 mb-10 pb-6 lg:pb-0">
        <LeftEclips className="absolute left-0" />
        <Dots className="absolute right-0 bottom-6" />
        <div className="xl:container mx-auto px-10 pt-8">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2">
              <h2 className="text-5xl font-bold leading-tight hidden lg:block">
                Leading Academic Writing Services
              </h2>
              <div className="text-2xl max-w-[90%] mt-4 hidden lg:block">
                We deliver the most trustworthy academic writing assistance for
                your online class!
              </div>
              <div className="hidden lg:block">
                <div className="flex mt-8">
                  <div className="text-3xl font-bold max-w-[250px]">
                    Get a quote in{" "}
                    <span className="text-[#ff641a]">60 seconds.</span>
                  </div>

                  <SpiralArrow />
                  {/* <Image /> */}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
              <Image
                src={studentsImg}
                alt="students"
                className="max-w-[500px] w-full"
              />
              <div className="text-3xl font-bold text-center mt-2 block lg:hidden">
                Get a quote in{" "}
                <span className="text-[#ff641a]">60 seconds.</span>
              </div>
            </div>
          </div>
          {activeStep === 1 && (
            <Step1
              apiPayload={apiPayload}
              setActiveStep={setActiveStep}
              setApiPayload={setApiPayload}
            />
          )}
          {activeStep === 2 && (
            <Step2
              apiPayload={apiPayload}
              setActiveStep={setActiveStep}
              setApiPayload={setApiPayload}
            />
          )}
          {activeStep === 3 && (
            <Step3
              apiPayload={apiPayload}
              setActiveStep={setActiveStep}
              setApiPayload={setApiPayload}
            />
          )}
          {activeStep === 4 && <Step4 apiPayload={apiPayload} />}
        </div>
      </div>
      <div className="container mx-auto px-10">
        <h2 className="text-3xl font-bold leading-tight block lg:hidden">
          Leading Academic Writing Services
        </h2>
        <div className="text-xl max-w-[90%] mt-4 block lg:hidden">
          We deliver the most trustworthy academic writing assistance for your
          online class!
        </div>
      </div>
    </div>
  );
};

export default GetFreeQuote;
