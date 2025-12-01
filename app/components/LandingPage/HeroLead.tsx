"use client";

import React from "react";

const CHECK_BG = "#9F92EC";
const PRIMARY_BG = "#9F92EC";
const SECONDARY_BG = "#B0B0B0";

const CheckBadge: React.FC = () => (
  <span
    className="inline-flex sm:h-8 sm:w-8 h-6 w-6 items-center justify-center rounded-full"
    style={{ backgroundColor: CHECK_BG }}
  >
    {/* white check */}
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 11.2L0.8 6.5L2.914 4.386L5.5 6.972L12.772 0L14.886 2.114L5.5 11.2Z"
        fill="white"
      />
    </svg>
  </span>
);

const HeroLead: React.FC = () => {
  return (
    <div className="max-w-2xl">
      <h1
        className="font-semibold text-[32px] md:text-[50px] leading-[1.1] text-black"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        Stop Sacrificing
        <br />
        Your Time, We'll
        <br />
        Handle Your
        <br />
        Classes
      </h1>

      <div className="mt-6 flex flex-col items-start gap-3">
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-[#E9E9F1] bg-white/80 px-4 py-2">
          <CheckBadge />
          <span className="sm:text-[16px] text-[14px] text-[#111318]">
            Free Up 20+ Hours/week
          </span>
        </div>
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-[#E9E9F1] bg-white/80 px-4 py-2">
          <CheckBadge />
          <span className="sm:text-[16px] text-[14px] text-[#111318]">
            24/7 support
          </span>
        </div>
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-[#E9E9F1] bg-white/80 px-4 py-2">
          <CheckBadge />
          <span className="sm:text-[16px] text-[14px] text-[#111318]">
            100% Confidential
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors cursor-pointer"
          style={{ backgroundColor: PRIMARY_BG }}
        >
          Take My Full Class
        </button>
        <button
          type="button"
          className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors"
          style={{ backgroundColor: SECONDARY_BG }}
        >
          Pass My Exam
        </button>
      </div>
    </div>
  );
};

export default HeroLead;
