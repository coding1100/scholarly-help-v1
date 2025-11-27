"use client";

import CurvedArrow from "@/app/assets/Icons/CurvedArrow";
import BgHeroBoyGirl from "@/app/assets/Images/bgHeroBoyGirl.webp";
import { FC, useState } from "react";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import CalculatorImg from "@/app/assets/Images/calculator-img.webp";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Confidentiality from "@/app/assets/Icons/Confidentiality";
import Downloads from "@/app/assets/Icons/Downloads";
import Guarantee from "@/app/assets/Icons/Guarantee";
import SpamAlert from "@/app/assets/Icons/SpamAlert";

import SamplesHeroImg from "@/app/assets/Images/samplesHeroImg.webp";
// import Step4 from "@/app/(pages)/do-my-class/component/Step4";
import { formFreeQuote, phoneEmailMsgForm } from "../HideLinks/HideLinks";
import ZohoForm2 from "./ZohoForm2";

type Content = {
  heading1?: string;
  mainHeading?: string;
  heading2?: string;
  description: string;
};

interface HeroProps {
  content: Content;
}
const Hero: FC<HeroProps> = ({ content }) => {
  const { isMobile } = useBreakpoint();
  const [openModal, setOpenModal] = useState(false);
  const currentPage = usePathname();

  const freeQuoteForm = formFreeQuote.includes(currentPage);
  const freeQuotephoneEmailMsg = phoneEmailMsgForm.includes(currentPage);

  const handleModel = () => {
    setOpenModal(true);
  };

  if (currentPage === "/samples/") {
    return (
      <div className="bg-primary-300 pt-16 pb-16 lg:flex justify-center">
        <div className="xl:container sm:pl-10 pl-5 xl:pr-10 sm:pr-0 pr-5">
          <div className="grid grid-cols-12">
            <div className="xl:col-span-6 lg:col-span-7 col-span-12">
              <div className="text-primary-500 sm:text-5xl text-3xl font-bold">
                {content.heading1 && <p>{content.heading1}</p>}
                {content.mainHeading && (
                  <h1 className="sm:mt-6 mt-2 sm:mb-6 mb-2">
                    {content.mainHeading}
                  </h1>
                )}
                {content.heading2 && <p>{content.heading2}</p>}
              </div>
              <div className="mt-10 grid grid-cols-12 sm:text-lg">
                <div className="sm:col-span-6 col-span-12 flex items-center">
                  <div className={`md:w-10 w-6 mr-3`}>
                    <Confidentiality />
                  </div>
                  <div>100% confidential</div>
                </div>
                <div className="sm:col-span-6 col-span-12 flex items-center">
                  <div className={`md:w-10 w-6 mr-3`}>
                    <SpamAlert />
                  </div>
                  <div>No spam</div>
                </div>
              </div>
              <div className="sm:mt-2 grid grid-cols-12 sm:text-lg">
                <div className="sm:col-span-6 col-span-12 flex items-center">
                  <div className={`md:w-10 w-6 mr-3`}>
                    <Downloads />
                  </div>
                  <div>Plagiarism Free Work</div>
                </div>
                <div className="sm:col-span-6 col-span-12 flex items-center">
                  <div className={`md:w-10 w-6 mr-3`}>
                    <Guarantee />
                  </div>
                  <div>Money Back Guarantee</div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-6 lg:col-span-5 col-span-12">
              <div className="flex lg:justify-end justify-center">
                <Image src={SamplesHeroImg} alt="img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-primary-300 ${currentPage === "/tools" && "mb-20"}`}>
      <div
        className={`xl:flex justify-center bg-contain bg-no-repeat bg-right-bottom px-10 ${
          currentPage === "/tools"
            ? "lg:none"
            : `${isMobile ? "none" : `bg-heroImage`}`
        }`}
        // style={{
        //   backgroundImage: `${
        //     currentPage === "/tools"
        //       ? "lg:none"
        //       : `${isMobile ? "none" : `url(${BgHeroBoyGirl.src})`}`
        //   }`,
        //   // backgroundSize: "550px",
        // }}
      >
        <div className="xl:container xl:px-10 grid lg:grid-cols-2">
          <div
            className={`xl:py-12 lg:pt-20 lg:pb-4 lg:w-full ${
              !isMobile && "w-[400px]"
            } mb-9`}
          >
            {content.heading1 && (
              <div className="w-auto flex">
                <p
                  className={`text-primary-500 font-bold ${
                    currentPage !== "/"
                      ? "md:text-5xl text-3xl mb-4"
                      : "md:text-3xl text-xl"
                  } mt-2 mr-2`}
                >
                  {content.heading1}
                </p>
                <span className={`${currentPage !== "/" && "hidden"} w-10`}>
                  <CurvedArrow />
                </span>
              </div>
            )}
            <div>
              {content.mainHeading && (
                <h1 className="text-primary-500 md:font-bold font-extrabold md:text-5xl text-3xl md:leading-[65px]">
                  {content.mainHeading}
                </h1>
              )}
              {content.heading2 && (
                <p
                  className={`text-primary-500 font-bold ${
                    currentPage !== "/"
                      ? "md:text-5xl text-3xl mt-4"
                      : "md:text-3xl text-xl"
                  }`}
                >
                  {content.heading2}
                </p>
              )}
              <div className={`${!isMobile && "max-w-[520px]"} py-5`}>
                <div
                  className="text-primary-500 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: content.description }}
                ></div>
              </div>
              <div className="flex justify-center md:justify-start">
                <div className="sm:w-[70%] w-full">
                  <ZohoForm2 />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${
              currentPage === "/tools"
                ? "flex lg:justify-start justify-center"
                : "hidden"
            }`}
          >
            <div className="lg:w-full md:w-[200px]">
              <Image src={CalculatorImg} alt="image" />
            </div>
          </div>
          <div
            className={`${
              currentPage === "/tools"
                ? "hidden"
                : ` ${!isMobile ? "hidden" : "flex justify-center"}`
            }`}
          >
            <Image src={BgHeroBoyGirl} alt="image" />
          </div>
        </div>
      </div>
      {/* <PopUpModal open={openModal} handleClose={() => setOpenModal(false)} /> */}
    </div>
  );
};

export default Hero;
