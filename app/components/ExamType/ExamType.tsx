"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Button from "../Button/Button";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";
import SampleBg from "@/app/assets/Images/sampleBg.webp";
import { sampleCardContent } from "./content";
import Proctored from "@/app/assets/Images/proctored.webp";
type Content = {
  img?: any;
  title?: string;
  description?: string;
};

interface ExamTypeProps {
  content: Content[];
}
const ExamType: FC<ExamTypeProps> = ({ content }) => {
  return (
    <div
      className="py-8 relative bg-primary-500 xl:flex justify-center"
      style={{ backgroundImage: `url(${SampleBg.src})` }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-primary-500 opacity-90"></div>
      <div className="xl:container xl:px-10 z-10 relative">
        <div>
          <h2 className="md:text-5xl sm:text-3xl text-2xl font-bold text-white text-center">
            Types Of Exams We Take For You
          </h2>
        </div>
        <div className="py-12 sm:px-20 px-10">
          <div className="grid grid-cols-2 gap-3">
            {content.map((item, i) => (
              <div
                key={i}
                className="sm:flex justify-center items-end md:col-span-1 col-span-2"
              >
                <div className="mr-6 max-w-40">
                  <Image src={item.img} alt="image" />
                </div>
                <div className="text-white">
                  <p>{item.title}</p>
                  <p className="text-xs leading-5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <a href="javascript:void(Tawk_API.toggle())">
            <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
              Place an Order Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExamType;
