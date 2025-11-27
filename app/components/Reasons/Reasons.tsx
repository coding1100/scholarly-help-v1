"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import ReasonsContent from "./content";

interface ReasonsProps {}
const Reasons: FC<ReasonsProps> = ({}) => {
  const currentPage = usePathname();
  return (
    <div className="bg-primary-100 pt-9 pb-12">
      <div className="md:container md:mx-auto mx-8">
        <div>
          <h2
            className="md:text-5xl text-2xl font-bold text-primary-500 text-center px-3"
            style={{ lineHeight: "65px" }}
          >
            Reasons Why You Can Ask Us To “Take My Exam Help”
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-6 pt-10">
          {ReasonsContent.map((item, index) => (
            <div key={index} className="md:col-span-6 col-span-12 flex">
              <div className="mr-3">
                <Image className="max-w-[60px]" src={item.icon} alt="" />
              </div>
              <div>
                <div className="text-primary-500 md:text-xl font-semibold">
                  {item.title}
                </div>
                <div className="text-primary-500 leading-7">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reasons;
