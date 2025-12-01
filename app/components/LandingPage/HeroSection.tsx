"use client";

import React from "react";
import HeroLead from "./HeroLead";
import HeroRight from "./HeroRight";
import ReviewBar from "./ReviewBar";
const Star: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="#FFB400"/>
  </svg>
);
const HeroSection: React.FC = () => {
  return (
    <section className="w-full bg-[#F5F6FA] pb-[100px]">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
          <HeroLead />
          </div>
          <div className="md:col-span-4">
          <HeroRight />
          </div>
          <div className="md:col-span-3 md:self-end">
            <div className="hidden md:flex flex-col gap-5">
              <div className="flex max-w-xs flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Star /><Star /><Star /><Star /><Star />
                </div>
                <div className="font-semibold text-[#1E1E1E]">Stress Free A+</div>
                <p className="text-[14px] leading-6 text-[#555B66]">
                  Scholarly has taken 100% of the stress I usually deal with when...
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F3F8] text-[12px] text-[#6A6F7A]">T</span>
                  <div className="text-[12px] text-[#6A6F7A]">
                    <div>Tom Q.</div>
                    <div>Engineering Student, Devry University</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-8 md:mt-10">
          <ReviewBar />
        </div> */}
      </div>
      
    </section>
  );
};

export default HeroSection;


