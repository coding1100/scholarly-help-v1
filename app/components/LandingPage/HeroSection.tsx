"use client";

import React, { FC, ReactNode } from "react";
import HeroLead from "./HeroLead";
import HeroRight from "./HeroRight";
import { StaticImageData } from "next/image";
import { usePageData } from "./usePageData";
import { usePathname } from "next/navigation";

const Star: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      fill="#FFB400"
    />
  </svg>
);

interface HeroSectionProps {
  heroContent?: {
    mainHeading: string;
    subHeading?: string;
    description: string;
    btn1: string;
    btn2: string;
    formBackImg2: StaticImageData;
  };
  /** Server-rendered heading slot for LCP (avoids 2.5s element render delay) */
  headingSlot?: ReactNode;
  /** When true, use HeroForm2 (different field order) instead of default HeroForm */
  useHeroForm2?: boolean;
}
const HeroSection: FC<HeroSectionProps> = ({
  heroContent: propHeroContent,
  headingSlot,
  useHeroForm2,
}) => {
  const data = usePageData();
  const heroContent = propHeroContent || data?.heroSection;
const cuurentRoute = usePathname();
const increaseSpace = [
  "/take-my-class-professor-does-not-care/",
  "/take-my-class-still-doing/",
  "/take-my-class-protect-gpa/",
  "/take-my-class-always-working-harder/",
];
  return (
    <section
      id="hero-section"
      className="w-full bg-[#F5F6FA] pb-[100px] max-[1320px]:px-8 max-[768px]:px-6 max-[768px]:shadow-[inset_0px_200px_123px_-131px_rgba(211,212,247,0.9)]"
    >
      <div className="mx-auto max-w-7xl py-10 !pt-[100px] md:py-14 max-[768px]:!pt-[30px]">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12 max-[768px]:gap-2">
          <div className="mid:col-span-5 md:col-span-6">
            {headingSlot}
            <HeroLead heroContent={heroContent} hideHeading={!!headingSlot} />
          </div>
          <div className="mid:col-span-4 md:col-span-6">
            <HeroRight
              formBackImg2={heroContent?.formBackImg2}
              useHeroForm2={useHeroForm2}
            />
          </div>
          <div className={`mid:col-span-3 md:col-span-6 md:self-end relative z-20 -bottom-[35px] sm:block hidden ${increaseSpace.includes(cuurentRoute) ? "md:pt-[250px]" : ""}`}>
            <div className="hidden md:flex flex-col gap-5">
              <div className="flex max-w-xs flex-col gap-2">
                <div className="flex items-center gap-1">
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </div>
                <div className="font-semibold text-[#1E1E1E]">
                  Stress Free A+
                </div>
                <p className="text-[14px] leading-6 text-[#555B66]">
                  Scholarly has taken 100% of the stress I usually deal with
                  when...
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {/* <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F3F8] text-[12px] text-[#6A6F7A]">
                    <Image
                      src={TomIcon}
                      alt="Tom Icon"
                      className="max:w-[31px] min-w-[28px]"
                    />
                  </span> */}
                  <div className="text-[12px] text-[#6A6F7A]">
                    <div></div>
                    <div>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F3F8] text-[12px] text-[#6A6F7A] border border-[#c7c7c7] mr-[5px] bg-[#eee]">
                        T
                      </span>{" "}
                      Engineering Student, Devry University
                    </div>
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
