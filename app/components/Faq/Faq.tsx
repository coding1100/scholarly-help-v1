"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import DownArrow from "@/app/assets/Images/faqDropdown.webp";

type Content = {
  id?: number;
  question?: string;
  answer: string;
};

interface FaqProps {
  content: Content[];
}
const Faq: FC<FaqProps> = ({ content }) => {
  // const [open, setOpen] = useState(1);
  // const handleOpen = (value: any) => setOpen(open === value ? 0 : value);
  const [isActive, setIsActive] = useState<number | null>(null);

  const [showMore, setShowMore] = useState(false);

  const handleDropdown = (i: number) => {
    setIsActive((prev) => (prev === i ? null : i));
  };

  const toggleFaqs = () => {
    setShowMore(!showMore);
  };
  return (
    <div className="sm:py-14 py-8 xl:flex justify-center">
      <div className="xl:container px-10">
        <div>
          <h2 className="md:text-5xl text-2xl font-bold text-primary-500 text-center">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="lg:hidden grid grid-cols-2 gap-6 mt-10">
          {content.slice(0, !showMore ? 3 : content.length).map((item, i) => (
            <div
              key={i}
              className={`lg:col-span-1 col-span-2 duration-500 transition-all ${
                isActive === i
                  ? "bg-primary-200 border border-primary-200 rounded-md max-h-full duration-500"
                  : "duration-500 max-h-[90px] overflow-hidden justify-center border transition-all border-primary-500 hover:border-primary-400 rounded"
              } px-5 py-6 mb-3`}
            >
              <div
                onClick={() => handleDropdown(i)}
                className={`flex justify-between items-center`}
              >
                <div className="w-[90%]">
                  <h3 className="sm:text-lg text-sm font-semibold">
                    {item.question}
                  </h3>
                </div>
                <div
                  className={`w-10 duration-500 ${
                    isActive === i ? "-rotate-180" : "rotate-0"
                  }`}
                >
                  <Image src={DownArrow} alt="icon" />
                </div>
              </div>
              {/* <p className="mt-5 whitespace-pre-line">{item.answer}</p> */}
              <div
                className="mt-5 whitespace-pre-line sm:text-base text-sm"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              ></div>
            </div>
          ))}
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-6 mt-10">
          {content.map((item, i) => (
            <div
              key={i}
              className={`lg:col-span-1 col-span-2 duration-500 transition-all ${
                isActive === i
                  ? "bg-primary-200 border border-primary-200 rounded-md"
                  : "h-[90px] overflow-hidden justify-center border transition-all border-primary-500 hover:border-primary-400 rounded"
              } px-5 py-6 mb-3`}
            >
              <div
                onClick={() => handleDropdown(i)}
                className={`flex justify-between items-center`}
              >
                <div className="w-[90%]">
                  <h3 className="sm:text-lg text-sm font-semibold">
                    {item.question}
                  </h3>
                </div>
                <div
                  className={`w-10 duration-500 ${
                    isActive === i ? "-rotate-180" : "rotate-0"
                  }`}
                >
                  <Image src={DownArrow} alt="icon" />
                </div>
              </div>
              {/* <p className="mt-5">{item.answer}</p> */}
              <div
                className="mt-5 sm:text-base text-sm"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              ></div>
            </div>
          ))}
        </div>
        <div
          className="flex justify-center mt-8 mb-6 lg:hidden"
          onClick={toggleFaqs}
        >
          <p className="w-64 text-primary-500 text-center font-bold">
            {showMore === true ? "Show Less FAQs" : "Show More FAQs"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Faq;
