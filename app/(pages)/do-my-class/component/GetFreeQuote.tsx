"use client";

import Dots from "@/app/assets/Icons/Dots";
import LeftEclips from "@/app/assets/Icons/LeftEclips";
import SpiralArrow from "@/app/assets/Icons/SpiralArrow";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import studentsImg from "@/app/assets/Images/students_image.png";
import { usePathname } from "next/navigation";
import Step4 from "@/app/components/FreeQuoteForm/Step4";

interface GetFreeQuoteProps {}
const GetFreeQuote: FC<GetFreeQuoteProps> = ({}) => {
  const currentRoute = usePathname();
  return (
    <div>
      <div className="bg-primary-500 text-center text-white py-3 md:hidden block">
        Get 10% Discount - Limited Time Offer!
      </div>
      <div className="bg-[#e4e4fa] relative pt-10 pb-6 ">
        <LeftEclips className="absolute left-0" />
        <Dots className="absolute right-0 bottom-6 md:block hidden" />
        <div className="xl:container mx-auto px-10 sm:pt-8">
          <div className="md:flex">
            <div className="w-full lg:w-1/2">
              <h2 className="lg:text-5xl sm:text-3xl text-2xl font-bold leading-tight">
                Struggling To Keep Up With Your Online Classes?
              </h2>
              <div className="lg:text-2xl sm:text-xl max-w-[90%] mt-4 sm:mb-0 mb-4">
                Pay us to handle your coursework,{" "}
                {currentRoute !== "/do-my-class-2/" && "assignments,"}
                and discussions. Ace your classes stress-free with our online
                class help services.
              </div>
              <div className="sm:block hidden">
                <div className="flex mt-8">
                  <div className="sm:text-3xl text-2xl font-bold max-w-[250px]">
                    Get a quote in <br />
                    <span className="text-[#ff641a]">5 Minutes.</span>
                  </div>

                  <SpiralArrow />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 md:flex hidden flex-col justify-center items-center">
              <Image
                src={studentsImg}
                alt="students"
                className="max-w-[500px] w-full"
              />
              {/* <div className="text-3xl font-bold text-center mt-2 block lg:hidden">
                Get a quote in{" "}
                <span className="text-[#ff641a]">5 Minutes.</span>
              </div> */}
            </div>
          </div>
          {/* this is the neighbour file
          <Step4 /> */}
          {/* This is from global components FreeQuoteForm */}
          <Step4 />
          <div className="w-full lg:w-1/2 flex md:hidden flex-col justify-center items-center">
            <Image
              src={studentsImg}
              alt="students"
              className="max-w-[500px] w-full"
            />
            {/* <div className="text-3xl font-bold text-center mt-2 block lg:hidden">
                Get a quote in{" "}
                <span className="text-[#ff641a]">5 Minutes.</span>
              </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetFreeQuote;
