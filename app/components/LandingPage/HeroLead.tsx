"use client";

import React, { FC } from "react";
import { usePathname } from "next/navigation";
import respavatar from "@/app/assets/Images/resp-avatar.webp";
import Link from "next/link";
import Image from "next/image";
import { styleParentheticalText } from "./heroHeadingUtils";
import { FaCircleCheck } from "react-icons/fa6";
import {
  isTakeMyClassLandingPage,
  normalizePathname,
  pathnameIncludesTakeMyClass,
  TAKE_MY_CLASS_3_PATH,
  TAKE_MY_CLASS_PATH,
  TAKE_MY_CLASS_PROFESSOR_PATH,
  TAKE_MY_CLASS_STILL_DOING_PATH,
  TAKE_MY_CLASS_PROTECT_GPA_PATH,
  TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
  TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
} from "@/app/lib/takeMyClassLandingRoutes";

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

interface HeroLeadProps {
  heroContent?: {
    mainHeading: string;
    subHeading?: string;
    description: string;
    btn1: string;
    btn2: string;
    btn1Url?: string;
    btn2Url?: string;
  };
  /** When true, heading is rendered by server (HeroHeading) for LCP; only badges/buttons show here */
  hideHeading?: boolean;
}
const HeroLead: FC<HeroLeadProps> = ({ heroContent, hideHeading }) => {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname);
  const isTakeMyClassPage = isTakeMyClassLandingPage(pathname);

  // Routes where badges section should be hidden
  const hiddenRoutes = new Set(
    [
      "/a-or-b-grade-guarantee",
      "/on-time-delivery-guarantee",
      "/success-stories-and-reviews",
      "/tools",
      "/guarantee-anonymity",
      "/plagiarism-free-process",
      "/us-based-phd-experts",
      TAKE_MY_CLASS_PATH,
      `${TAKE_MY_CLASS_PATH}/`,
      TAKE_MY_CLASS_3_PATH,
      `${TAKE_MY_CLASS_3_PATH}/`,
      TAKE_MY_CLASS_PROFESSOR_PATH,
      `${TAKE_MY_CLASS_PROFESSOR_PATH}/`,
      TAKE_MY_CLASS_STILL_DOING_PATH,
      `${TAKE_MY_CLASS_STILL_DOING_PATH}/`,
      TAKE_MY_CLASS_PROTECT_GPA_PATH,
      `${TAKE_MY_CLASS_PROTECT_GPA_PATH}/`,
      TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
      `${TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH}/`,
      TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
      `${TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH}/`,
      "/take-my-exam",
      "/take-my-exam/",
    ].map((route) => route.replace(/\/+$/, "") || "/"),
  );

  const isOnlineClassPage = (pathname || "").includes("/online-class/");
  const isAssignmentPage = (pathname || "").includes("/assignment/");
  const isExamsPage =
    normalizedPath === "/exams" ||
    normalizedPath === "/exam" ||
    normalizedPath.startsWith("/exams/") ||
    normalizedPath.startsWith("/exam/");
  const isHomePage =
    normalizedPath === "/homework" || normalizedPath.startsWith("/homework/");
  const isEssayWritingPage =
    normalizedPath === "/essay-writing" ||
    normalizedPath.startsWith("/essay-writing/");

  const shouldHideBadges =
    hiddenRoutes.has(normalizedPath) ||
    isOnlineClassPage ||
    normalizedPath === "/" ||
    isExamsPage ||
    isHomePage ||
    isAssignmentPage ||
    isEssayWritingPage ||
    normalizedPath === "/take-my-class-2" ||
    normalizedPath === "/take-my-proctored-exam-for-me";

  // Routes where buttons should be hidden
  const buttonHiddenRoutes = new Set(
    [
      TAKE_MY_CLASS_PATH,
      `${TAKE_MY_CLASS_PATH}/`,
      TAKE_MY_CLASS_3_PATH,
      `${TAKE_MY_CLASS_3_PATH}/`,
      TAKE_MY_CLASS_PROFESSOR_PATH,
      `${TAKE_MY_CLASS_PROFESSOR_PATH}/`,
      TAKE_MY_CLASS_STILL_DOING_PATH,
      `${TAKE_MY_CLASS_STILL_DOING_PATH}/`,
      TAKE_MY_CLASS_PROTECT_GPA_PATH,
      `${TAKE_MY_CLASS_PROTECT_GPA_PATH}/`,
      TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH,
      `${TAKE_MY_CLASS_ALWAYS_WORKING_HARDER_PATH}/`,
      TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH,
      `${TAKE_MY_CLASS_SAVING_YOUR_FUTURE_PATH}/`,
      "/take-my-class-2",
      "/take-my-class-2/",
      "/take-my-exam",
      "/take-my-exam/",
      "/take-my-proctored-exam-for-me",
    ].map((route) => route.replace(/\/+$/, "") || "/"),
  );
  const isOnlineClassRoute =
    normalizedPath === "/online-class" ||
    normalizedPath.startsWith("/online-class/");
  const isExamRoute =
    normalizedPath === "/exams" ||
    normalizedPath.startsWith("/exams/") ||
    normalizedPath === "/exam" ||
    normalizedPath.startsWith("/exam/");

  const shouldHideButtons =
    normalizedPath === "/" ||
    buttonHiddenRoutes.has(normalizedPath) ||
    isOnlineClassRoute ||
    isAssignmentPage ||
    isHomePage ||
    isEssayWritingPage ||
    isExamRoute;

  const getStyledMainHeading = (heading: string) => {
    // const shouldHighlightAfterPipe =
    //   isOnlineClassPage ||
    //   isExamRoute ||
    //   pathname === "/take-my-class-2/" ||
    //   pathname === "/take-my-proctored-exam-for-me/";

    // if (!shouldHighlightAfterPipe) {
    //   return styleParentheticalText(heading);
    // }

    if (!heading.includes("|")) {
      return styleParentheticalText(heading);
    }

    const [beforePipe, ...afterPipeParts] = heading.split("|");
    const afterPipe = afterPipeParts.join("|");

    return `${styleParentheticalText(beforePipe)}|<span class="text-[#F56200]">${styleParentheticalText(afterPipe)}</span>`;
  };

  return (
    <div className="max-w-2xl">
      {!hideHeading && (
        <h1 className="font-semibold text-[30px] md:text-[48px] leading-[1.1] text-black">
          {heroContent?.mainHeading ? (
            <span
              className={isTakeMyClassPage ? "md:pt-5 block" : undefined}
              dangerouslySetInnerHTML={{
                __html: getStyledMainHeading(heroContent.mainHeading),
              }}
            />
          ) : isTakeMyClassPage ? (
            <div className="md:pt-5">
              We Take Your Online Class |{" "}
              <span className="text-[#F56200]">Guaranteed A or B</span>
            </div>
          ) : (
            <>
              Stop Sacrificing
              <br />
              Your Time, We&apos;ll
              <br />
              Handle Your
              <br />
              Classes
            </>
          )}
        </h1>
      )}

      {!shouldHideBadges && (
        <div className="mt-6 max-[768px]:mt-3 flex flex-col items-start gap-3 relative">
          <div className="inline-flex items-center gap-2 self-start rounded-full border max-[768px]:bg-[#D3D4F7] border-[#E9E9F1] bg-white/80 px-4 max-[768px]:px-3 py-2 z-[9]">
            <div>
              <CheckBadge />
            </div>
            <span className="sm:text-[16px] text-[14px] text-[#111318]">
              Free Up 20+ Hours/week
            </span>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border max-[768px]:bg-[#D3D4F7] border-[#E9E9F1] bg-white/80 max-[768px]:px-3 px-4 py-2 z-[9]">
            <div>
              <CheckBadge />
            </div>

            <span className="sm:text-[16px] text-[14px] text-[#111318]">
              24/7 support
            </span>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border max-[768px]:bg-[#D3D4F7] border-[#E9E9F1] bg-white/80 max-[768px]:px-3 px-4 py-2 z-[9]">
            <div>
              <CheckBadge />
            </div>
            <span className="sm:text-[16px] text-[14px] text-[#111318]">
              100% Confidential
            </span>
          </div>
          <div className="min-[768px]:hidden">
            <Image
              src={respavatar}
              alt=""
              className="absolute right-0 bottom-0 max-[430px]:w-[130px] max-[430px]:h-[130px]"
              priority
            />
          </div>
        </div>
      )}

      {/* {heroContent?.subHeading && shouldHideBadges && (
        <div
          className="text-black text-[19px] mt-3 font-semibold "
          dangerouslySetInnerHTML={{ __html: heroContent.subHeading }}
        />
      )} */}

      {/* Done */}
      {heroContent?.description && shouldHideBadges && (
        <div
          className="text-[#263238] text-[16px] mt-3 "
          dangerouslySetInnerHTML={{
            __html: styleParentheticalText(heroContent?.description || ""),
          }}
        />
      )}

      {/* Done */}
      {(isTakeMyClassPage || shouldHideBadges) && (
        <div className="sm:mt-6 mt-2">
          <div className="flex justify-between items-center sm:gap-5 gap-2">
            <div className="p-3 flex items-start gap-3 sm:bg-white sm:border sm:border-[#E2E1F3] rounded-lg">
              <FaCircleCheck className="text-[#9F92EC] !text-[27px] sm:block hidden" />
              <p className="sm:text-xl text-sm">
                Domestic Logins{" "}
                <span className="sm:font-bold">(No IP Bans)</span>
              </p>
            </div>
            <div className="w-[1px] bg-[#97979A] h-[26px] sm:hidden block"></div>
            <div className="p-3 flex items-start gap-3 sm:bg-white sm:border sm:border-[#E2E1F3] rounded-lg">
              <FaCircleCheck className="text-[#9F92EC] text-[27px] sm:block hidden" />
              <p className="sm:text-xl text-sm">
                <span className="sm:font-bold">Money-Back</span> Grade Guarantee
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Done */}
      {!shouldHideButtons && (
        <div className="mt-6 max-[768px]:mt-2 flex gap-4">
          {heroContent?.btn1Url ? (
            <Link
              href={heroContent.btn1Url}
              className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors cursor-pointer max-[768px]:flex-grow  max-[768px]:text-center"
              style={{ backgroundColor: PRIMARY_BG }}
            >
              {heroContent?.btn1 ? heroContent.btn1 : "Take My Full Class"}
            </Link>
          ) : (
            <button
              type="button"
              className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors cursor-pointer max-[768px]:flex-grow  max-[768px]:text-center"
              style={{ backgroundColor: PRIMARY_BG }}
            >
              {heroContent?.btn1
                ? heroContent.btn1
                : "Secure My 'A' or 'B' Grades"}
            </button>
          )}

          {!pathnameIncludesTakeMyClass(pathname) && (
            <>
              {heroContent?.btn2Url ? (
                <Link
                  href={heroContent.btn2Url}
                  className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors cursor-pointer max-[768px]:flex-grow  max-[768px]:text-center"
                  style={{ backgroundColor: SECONDARY_BG }}
                >
                  {heroContent?.btn2 ? heroContent.btn2 : "Pass My Exam"}
                </Link>
              ) : (
                <button
                  type="button"
                  className="rounded-md px-5 py-3 sm:text-[15px] text-sm font-medium text-white shadow-sm transition-colors"
                  style={{ backgroundColor: SECONDARY_BG }}
                >
                  {heroContent?.btn2 ? heroContent.btn2 : "Pass My Exam"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroLead;
