"use client";

import { FC, useState } from "react";
import BoyWithBook from "@/app/assets/Images/boyWithBook.webp";
import DownChevron from "@/app/assets/Icons/DownChevron";
import Idea from "@/app/assets/Icons/Idea";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import { usePathname } from "next/navigation";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import "./index.css";
type Header = {
  mainHeading: string;
  mainDescription: string;
};

type Content = {
  id?: number;
  icon?: string;
  title: string;
  description?: string;
};

interface WhyScholarlyProps {
  content: Content[];
  header: Header;
}
const WhyScholarly: FC<WhyScholarlyProps> = ({ content, header }) => {
  const [isActive, setIsActive] = useState<number | null>(null);
  const currentPage = usePathname();

  const { isMobile } = useBreakpoint();

  const handleDropDown = (index: number) => {
    setIsActive((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`pt-14 flex justify-center ${
        currentPage === "/" ? "bg-primary-300" : "bg-white"
      }`}
    >
      <div className="container xxl:px-10 sm:px-0 px-10">
        <div>
          <h2 className="font-bold text-[#000] text-center text-[42px]  mb-3">
            {header.mainHeading}
          </h2>
          <div
            className="text-center md:text-lg md:mt-5 mt-2"
            dangerouslySetInnerHTML={{ __html: header.mainDescription }}
          ></div>
        </div>
        <div
          // className="grid grid-cols-2 aspect-ratio: 2 / 1; bg-no-repeat bg-contain bg-right"
          className="bg-no-repeat bg-contain bg-right sm:mt-20 mt-10 md:px-0 sm:px-16"
          style={{
            backgroundImage: isMobile ? "none" : `url(${BoyWithBook.src})`,
            backgroundSize: "400px",
          }}
        >
          <div className="grid grid-cols-2 lg:max-w-[835px]  sm:pb-32">
            {content.map((items, index) => (
              <div
                key={index}
                className="md:col-span-1 col-span-2 mb-10 lg:ml-8 md:mx-4"
              >
                <div
                  className={`bg-primary-200 border items-center border-[#DEE2E6] rounded-[20px] px-5 py-4 overflow-hidden duration-500 transition-all whyScholarlyAccordion ${
                    isActive !== index ? "max-h-[80px]" : "max-h-auto"
                    // isActive !== index ? "max-h-[72px]" : "max-h-auto"
                  }`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer pb-3"
                    onClick={() => handleDropDown(index)}
                  >
                    <div className="flex items-center">
                      <div className="w-11 relative">
                        <div className="w-10 before:left-[5px] before:bottom-[13px] before:content-[''] before:h-8 before:w-8 before:absolute before:bg-secondary-200 before:rounded-full">
                          <Idea />
                        </div>
                      </div>
                      <div className="mx-3 text-start font-semibold text-[#000] leading-5">
                        <h3>{items.title}</h3>
                      </div>
                    </div>
                    <div
                      className={`w-6 ${
                        isActive === index ? "-rotate-180" : "rotate-0"
                      }`}
                    >
                      <DownChevron />
                    </div>
                  </div>
                  <div className={`pt-4 pb-4`}>
                    <p>{items.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyScholarly;
