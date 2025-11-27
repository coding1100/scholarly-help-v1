"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Content = {
  icon?: any;
  title?: string;
  description?: string;
  isLast?: boolean;
};

// type Header = {
//   mainHeadeing?: string;
// }

interface AcademicPartnerProps {
  content: Content[];
  mainHeading: string;
  mainDescription?: string;
  btnText?: string;
}
const AcademicPartner: FC<AcademicPartnerProps> = ({
  content,
  mainDescription,
  mainHeading,
  btnText,
}) => {
  const currentPage = usePathname();
  return (
    <div
      className={`sm:py-14 py-10 xl:flex justify-center ${
        currentPage !== "/" && "bg-primary-300"
      }`}
    >
      <div className="xl:container px-10">
        <div>
          <h2
            className="md:text-5xl text-2xl font-bold text-primary-500 text-center md:leading-[65px]"
            dangerouslySetInnerHTML={{ __html: mainHeading }}
          />
          {/* <p className="md:text-5xl text-2xl font-bold text-primary-500 text-center md:leading-[65px]">
            {mainHeading}
          </p> */}
        </div>
        {mainDescription && (
          <div>
            <p className="text-center md:text-lg md:mt-5 mt-2">
              {mainDescription}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2">
          {content.map((items, i) => (
            <div key={i} className="md:col-span-1 col-span-2">
              {items.isLast ? (
                <div className="flex justify-center md:mt-0 mt-4 md:mr-32">
                  <Image
                    className="sm:max-w-full max-w-[70%]"
                    src={items.icon}
                    alt="Icon"
                  />
                </div>
              ) : (
                <div className="flex sm:pt-12 pt-6 sm:pr-10">
                  <div>
                    <div className="sm:min-w-[90px] sm:min-h-[90px] bg-primary-200 rounded-full sm:p-5 p-2 mr-5">
                      <Image
                        className="sm:min-w-full min-w-[25px]"
                        src={items.icon}
                        alt="Icon"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="sm:text-lg font-semibold">{items.title}</h3>
                    <p className="sm:text-base text-sm">{items.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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

export default AcademicPartner;
