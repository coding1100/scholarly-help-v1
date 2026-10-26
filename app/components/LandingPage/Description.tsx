"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { usePageData } from "./usePageData";
import { isTextCtaLandingPage } from "@/app/lib/takeMyClassLandingRoutes";
import TextUsCta from "./TextUsCta";
import { styleDescriptionMainHeading } from "./descriptionHeadingUtils";

const CHAR_LIMIT = 200;

function styleLinksOrange(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    if (/style\s*=\s*["'][^"']*["']/i.test(attrs)) {
      return `<a${attrs.replace(
        /style\s*=\s*["']([^"']*)["']/i,
        (_m: string, styleValue: string) =>
          `style="${styleValue}; color: #F56200;"`,
      )}>`;
    }
    return `<a${attrs} style="color: #F56200;">`;
  });
}

const HowWeHelp: React.FC = () => {
  const data = usePageData();
  const description = data?.description;
  const isTextCta = isTextCtaLandingPage(usePathname());
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const scrollToQuote = () => {
    const quoteForm = document.getElementById("quote-form");
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: "smooth" });
    }
  };

  type ServiceType = {
    title: string;
    description: string;
  };

  const defaultServices: ServiceType[] = [
    {
      title: "Online Class Help",
      description:
        "Too busy or overwhelmed with daily tasks? We provide complete online class help — handling your entire course so you stay stress-free and on track.",
    },
    {
      title: "Essay Writing Services",
      description:
        "Need a polished, plagiarism-free essay delivered on time? Our writers craft compelling, original essays that are ready to submit.",
    },
    {
      title: "Online Exam Help",
      description:
        "No time to prep? No problem. Our experts take your exams for you, just like you'd expect when you pay someone to take my online class — with results that speak for themselves.",
    },
    {
      title: "Assignment Help",
      description:
        "Falling behind on assignments? Let us step in. When you ask us to do my online class for me, we make sure your coursework gets done right — and on time.",
    },
    {
      title: "Online Homework Assistance",
      description:
        "Tired of complex homework? We handle it quickly and accurately. Get real online classes help that saves time and gets results.",
    },
    {
      title: "100% Original Content",
      description:
        "Plagiarism is never an option. ScholarlyHelp provides papers written from scratch, with thorough checks using trusted plagiarism detection tools.",
    },
  ];

  const services =
    description?.services && description.services.length > 0
      ? description.services
      : defaultServices;

  const badges =
    description?.badges && description.badges.length > 0
      ? description.badges
      : [
          "Online Class Help",
          "Assignment Help",
          "Online Exam Help",
          "Essay Writing Services",
        ];

  const descriptionHtml = styleLinksOrange(
    description?.description ||
      "Your go-to source for top-notch academic writing services. Get excellence in every assignment. From essays and research papers to online classes and exam assistance, we offer a range of comprehensive services to meet your academic needs. Get A+ grades!<br />Are you finding it difficult to complete your assignment questions correctly and on time? Worry not, Scholarly Help offers 24/7 homework aid with reliable client support at your service.",
  );

  return (
    <section className="pt-[45px] pb-5 bg-white text-[#171717]">
      <div className="max-w-7xl mx-auto  max-[1320px]:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-[42px] leading-[42px] max-[768px]:text-[28px] text-[#000] font-bold mb-4"
            dangerouslySetInnerHTML={{
              __html: styleDescriptionMainHeading(
                description?.mainHeading || "How We Help You Succeed",
              ),
            }}
          />
          <p
            className="text-sm sm:text-base md:text-lg text-gray-600 w-full html font-normal text-[17px] leading[1.4] tracking-normal text-center"
            dangerouslySetInnerHTML={{
              __html: descriptionHtml,
            }}
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-20 gap-y-8 mb-12">
          {services.map((service: ServiceType, index: number) => {
            const text = service.description;
            const isLong = text.length > CHAR_LIMIT;
            const isExpanded = expandedIndices.has(index);
            const displayText =
              isLong && !isExpanded
                ? text.slice(0, CHAR_LIMIT).trim() +
                  (text.length > CHAR_LIMIT ? "..." : "")
                : text;
            const styledDisplayText = styleLinksOrange(displayText);

            return (
              <div key={index} className="bg-white">
                <h3 className="font-semibold text-[19.22px] leading-[120%] tracking-normal mb-3 text-[#171717]">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm font-normal text-[17px] leading-relaxed tracking-normal text-justify">
                  <span
                    dangerouslySetInnerHTML={{ __html: styledDisplayText }}
                  />
                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="ml-1 font-medium"
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Badges Row */}
        {/* <div className="flex flex-wrap sm:justify-center gap-4 md:gap-8 mb-10">
          {badges.map((badge: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-2 max-[768px]:px-0 px-4 sm:py-2 rounded-full text-sm font-medium "
            >
              <svg
                className="sm:w-8 w-6 sm:h-8 h-6 text-[#9F92EC]"
                fill="currentColor"
                viewBox="0 0 20  20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold text-[19.22px] leading-[120%] tracking-normal text-[#171717]">
                {badge}
              </p>
            </div>
          ))}
        </div> */}
        <div className="flex justify-center mt-[30px]">
          {isTextCta ? (
            <TextUsCta
              placement="description"
              buttonClassName="rounded-md px-6 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] max-[768px]:w-full font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
              textClassName="text-xl font-semibold text-[#171717]"
            />
          ) : (
            <button
              type="button"
              onClick={scrollToQuote}
              className="rounded-md px-6 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] max-[768px]:w-full font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
            >
              {description?.ctaButton?.text || "Secure My 'A' or 'B' Grades"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HowWeHelp;
