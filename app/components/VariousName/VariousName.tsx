"use client";

import { FC, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SubjectIcon from "@/app/assets/Images/subjectsIcon.webp";
import { it } from "node:test";

type Content = {
  title?: string;
  desciption?: string;
};

type Header = {
  mainHeadeing?: string;
};

interface VariousNameProps {
  content: Content[];
  mainHeading: string;
}
const VariousName: FC<VariousNameProps> = ({ content, mainHeading }) => {
  const currentPage = usePathname();
  return (
    <div className="py-8 xl:flex justify-center bg-primary-300">
      <div className="xl:container px-10">
        <div>
          <h2
            className="md:text-5xl text-2xl font-bold text-primary-500 text-center"
            // style={{ lineHeight: "65px" }}
          >
            {/* Help with Online Exam Under Various Names: You Name It, We Can Do
            It! */}
            {mainHeading}
          </h2>
        </div>
        <div className="grid grid-cols-3 mt-20 sm:px-4 gap-6">
          {content.map((item, i) => (
            <div key={i} className="md:col-span-1 col-span-3">
              <p className="font-semibold mb-1 text-lg">{item.title}:</p>
              <p className="sm:leading-7">{item.desciption}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <a href="javascript:void(Tawk_API.toggle())">
            <Button className="bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
              Pay Someone To Do My Online Exam
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default VariousName;
