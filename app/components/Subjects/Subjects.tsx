"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SubjectIcon from "@/app/assets/Images/subjectsIcon.webp";
import ShowMoreArrow from "@/app/assets/Images/multiDownArrow.svg";

type Content = {
  url?: string;
  title?: string;
};

// type Header = {
//   mainHeadeing?: string;
// }

interface SubjectsProps {
  content: Content[];
  mainHeading: string;
  btnText?: string;
}
const Subjects: FC<SubjectsProps> = ({ content, mainHeading, btnText }) => {
  const currentPage = usePathname();
  const [showMore, setShowMore] = useState(false);
  const toggleFaqs = () => {
    setShowMore(!showMore);
  };
  return (
    <div className="py-8 sm:py-14 xl:flex justify-center bg-primary-200">
      <div className="xl:container px-10">
        <div>
          <h2
            className="md:text-5xl text-2xl font-bold text-primary-500 text-center"
            style={{ lineHeight: "65px" }}
          >
            {/* Subjects We Work On */}
            {mainHeading}
          </h2>
          {currentPage !== "/essay-writing/" && (
            <div className="text-center md:text-lg md:mt-5 mt-2">
              Beyond the subjects listed below, we excel at handling diverse
              topics effectively. Our expertise knows no bounds, ensuring
              we&apos;re ready for any challenge that comes our way.
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 mt-20">
          {content.slice(0, !showMore ? 12 : content.length).map((item, i) => (
            <div
              key={i}
              className="lg:col-span-1 sm:col-span-2 col-span-4 min-h-[80px] pr-6 flex items-center"
            >
              {item.url ? (
                <Link href={item.url} className="flex items-center">
                  <div className="mr-4">
                    <div className="relative before:left-[3px] before:bottom-[17px] w-10 before:content-[''] before:h-9 before:w-9 before:absolute before:bg-secondary-200 before:rounded-full">
                      <Image
                        src={SubjectIcon}
                        alt="icon"
                        className="relative z-10"
                      />
                    </div>
                  </div>
                  <div className="text-lg">{item.title}</div>
                </Link>
              ) : (
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="relative before:left-[3px] before:bottom-[17px] w-10 before:content-[''] before:h-9 before:w-9 before:absolute before:bg-secondary-200 before:rounded-full">
                      <Image
                        src={SubjectIcon}
                        alt="icon"
                        className="relative z-10"
                      />
                    </div>
                  </div>
                  <div className="text-lg">{item.title}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        {currentPage !== "/essay-writing/" && (
          <div className="flex justify-center mt-12 mb-6">
            {showMore === true ? (
              <div className="rotate-180 ">
                <Image
                  className="animate-bounce"
                  onClick={toggleFaqs}
                  src={ShowMoreArrow}
                  alt="icon"
                />
              </div>
            ) : (
              <div className="animate-bounce">
                <Image
                  className=""
                  onClick={toggleFaqs}
                  src={ShowMoreArrow}
                  alt="icon"
                />
              </div>
            )}
          </div>
        )}
        <div className="flex justify-center mt-8">
          {currentPage === "/take-my-class/" ? (
            <Link href="#PhoneEmailMsgForm">
              <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                {/* Place an Order Now */}
                {btnText ? `${btnText}` : "Place an Order Now"}
              </Button>
            </Link>
          ) : (
            <Link href="javascript:void(Tawk_API.toggle())">
              <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                {/* Place an Order Now */}
                {btnText ? `${btnText}` : "Place an Order Now"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
