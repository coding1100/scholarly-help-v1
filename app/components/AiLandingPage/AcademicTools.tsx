"use client";

import Image from "next/image";
import { FC } from "react";
import RoundCheckIcon from "@/app/assets/Icons/roundCheck.png";
import Link from "next/link";

interface AcademicToolsProps {
  content: {
    heading1: string;
    description1: string;
    heading2: string;
    description2: string;
    tools: {
      title: string;
      description: string;
      list: string[];
      text: string;
      btnText: string;
      btnUrl?: string;
    }[];
  };
}

const AcademicTools: FC<AcademicToolsProps> = ({ content }) => {
  const getToolUrl = (btnText: string, btnUrl?: string) => {
    switch (btnText) {
      case "Generate Your Essay Now":
        return "/tools/ai-essay-generator";
      case "Paraphrase Your Text Instantly":
        return "/tools/ai-paraphraser";
      case "Summarize Any Text":
        return "/tools/ai-summarizer";
      case "Generate Your Thesis Statement":
        return "/tools/ai-thesis-generator";
      case "Generate Your Essay Title Instant":
        return "/tools/essay-title-generator";
      case "Generate Your Citation Now ":
        return "/tools/citation-generator";
      case "Solve Pythagoras Equation Quickly":
        return "/math-solver";
      case "Generate Your Research Questions ":
        return "/research-question";
      default:
        return btnUrl || "";
    }
  };
  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-14 md:mb-16 max-w-[895px] mx-auto">
        <h2 className="sm:text-[28px] text-[24px] md:text-[36px] lg:text-[42px] xl:text-[50px] lg:font-bold font-semibold text-black mb-3 sm:mb-7 xl:leading-[60px] lg:leading-[52px] leading-[42px]">
          {content.heading1}
        </h2>
        <p
          className="text-[14px] sm:text-[15px] md:text-[16px] font-normal text-[#263238] max-w-4xl mx-auto px-4 sm:px-0"
          dangerouslySetInnerHTML={{ __html: content.description1 }}
        />
      </div>
      <div className="text-center mb-8 sm:mb-10 md:mb-12 max-w-[895px] mx-auto">
        <h2 className="text-[22px] sm:text-[28px] md:text-[30px] lg:text-[40px] font-bold text-black mb-3 sm:mb-7 leading-[60px]">
          {content.heading2}
        </h2>
        <p
          className="text-[14px] sm:text-[15px] md:text-[16px] font-normal text-[#263238] max-w-4xl mx-auto px-4 sm:px-0"
          dangerouslySetInnerHTML={{ __html: content.description2 }}
        />
      </div>
      <div className="grid md:grid-cols-2 lg:gap-14 gap-10  max-w-7xl mx-auto">
        {content.tools.map((tool, index) => (
          <div
            key={index}
            className="col-span-1 px-7 pb-6 pt-10 border-[3px] border-[#D9D9D9] rounded-2xl relative z-20"
            style={{ boxShadow: "rgba(0, 0, 0, 0.15) 8px 8px 0px" }}
          >
            {/* <div className="absolute bg-[#D9D9D9] h-full w-full rounded-2xl -z-30 top-[10px] left-[10px]"></div> */}
            <p className="lg:text-[40px] md:text-[30px] text-[24px] lg:font-bold font-semibold lg:leading-[48px] md:leading-[38px] leading-[32px] text-black mb-3">
              {tool.title}
            </p>
            <p
              className="text-[17px] text-[#263238] mb-8"
              dangerouslySetInnerHTML={{ __html: tool.description }}
            />

            {tool.list.map((item, i) => (
              <div key={i} className="flex items-start gap-4 mb-5">
                <Image src={RoundCheckIcon} alt="icon" width={26} height={24} />
                <p className="text-[17px] font-bold text-[#263238]">{item}</p>
              </div>
            ))}
            <div className="px-9 py-5 bg-[#EDEFFE] rounded-[5px] mb-[17px]">
              <p className="text-[15px] text-[#263238]">{tool.text}</p>
            </div>
            <Link
              href={getToolUrl(tool.btnText, tool.btnUrl)}
              className="bg-[#9F92EC] text-center block !w-full rounded-md px-5 py-3 sm:text-lg text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#8B7EE8] focus:outline-none focus:ring-2 focus:ring-[#9F92EC] focus:ring-offset-2"
            >
              {tool.btnText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AcademicTools;
