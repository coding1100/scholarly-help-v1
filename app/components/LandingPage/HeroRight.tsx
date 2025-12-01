"use client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Illustration from "@/app/assets/Images/Hero-Group-195.png";

const HeroForm = dynamic(() => import("./HeroForm"), { ssr: false });
import Bg1 from "@/app/assets/Images/Hero-b-1.png";
import Bg2 from "@/app/assets/Images/Hero-b-2.png";
import Bg3 from "@/app/assets/Images/Hero-b-3.png";
import Bg4 from "@/app/assets/Images/Hero-b-4.png";
import Heart from "@/app/assets/Images/Hero-b-Heart.png";
import Update from "@/app/assets/Images/Hero-b-Update.png";
import Discount from "@/app/assets/Images/Hero-b-Discount.png";

const Star: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="#FFB400"/>
  </svg>
);

const HeroRight: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="relative flex items-start gap-6">
        {/* background decorative layer behind the form */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
          <Image src={Bg1} alt="bg1" className="absolute  -left-18 top-30 opacity-50" />
          <Image src={Bg3} alt="bg3" className="absolute -left-18 -top-10 opacity-50" />
          <Image src={Bg2} alt="bg2" className="absolute -left-18 top-70 opacity-50" />
          <Image src={Bg4} alt="bg4" className="absolute left-28 -top-20 opacity-50" />
          {/* <Image src={Heart} alt="heart" className="absolute right-[220px] top-8" /> */}
          {/* <Image src={Update} alt="update" className="absolute right-20 top-10" /> */}
          {/* <Image src={Discount} alt="discount" className="absolute right-[260px] top-56" /> */}
        </div>

        {/* form sits above decorative layer */}
        <div className="relative z-10 w-full max-w-md">
          <HeroForm />
        </div>

        {/* right column: illustration + rating stacked; illustration sits slightly under the form */}
        {/* <div className="relative z-1 -ml-12 hidden flex-col gap-5 md:flex">
          <Image src={Illustration} alt="A+ subject illustration" priority className="h-auto w-[340px]" />
          <div className="flex max-w-xs flex-col gap-2">
            <div className="flex items-center gap-1">
              <Star /><Star /><Star /><Star /><Star />
            </div>
            <div className="font-semibold text-[#1E1E1E]">Stress Free A+</div>
            <p className="text-[14px] leading-6 text-[#555B66]">
              Scholarly has taken 100% of the stress I usually deal with when...
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg[#F2F3F8] text-[12px] text-[#6A6F7A]">T</span>
              <div className="text-[12px] text-[#6A6F7A]">
                <div>Tom Q.</div>
                <div>Engineering Student, Devry University</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* mobile rating under the form */}
      <div className="flex max-w-md flex-col gap-2 md:hidden">
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
  );
};

export default HeroRight;


