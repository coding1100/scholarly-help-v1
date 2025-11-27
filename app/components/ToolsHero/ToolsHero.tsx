"use client";

import { FC, useState } from "react";
import BgHeroBoyGirl from "@/app/assets/Images/bgHeroBoyGirl.webp";
import CurvedArrow from "@/app/assets/Icons/CurvedArrow";
import Button from "../Button/Button";
import ChatBubbles from "@/app/assets/Icons/ChatBubbles";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CalculatorImg from "@/app/assets/Images/calculator-img.webp";

type Content = {
  mainHeading?: string;
  description?: string;
};

interface ToolsHeroProps {
  content: Content;
}
const ToolsHero: FC<ToolsHeroProps> = ({ content }) => {
  const { isMobile } = useBreakpoint();

  const currentPage = usePathname();
  return (
    <div className="lg:py-20 md:pt-20 bg-primary-300">
      <div className="xl:flex justify-center bg-no-repeat bg-contain bg-right px-10">
        <div className="xl:container xl:px-10 grid lg:grid-cols-2">
          <div>
            <h1
              className="text-primary-500 md:font-bold font-extrabold md:text-5xl text-3xl whitespace-pre-line"
              style={{ lineHeight: "65px" }}
            >
              {content.mainHeading}
            </h1>
            <div className={`${!isMobile && "max-w-[520px]"} py-5`}>
              <p className="text-primary-500 text-lg">{content.description}</p>
            </div>
            <div className="flex justify-center md:justify-start">
              <Button
                type="submit"
                className="md:w-[240px] w-[180px] flex justify-evenly md:px-16 px-10"
              >
                Read More
              </Button>
            </div>
          </div>
          <div className="w-full h-full">
            <div className="bg-primary-400 -rotate-12 w-full h-full">
              <div className="bg-white rotate-12 w-full h-full">
                this is calculator
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsHero;
