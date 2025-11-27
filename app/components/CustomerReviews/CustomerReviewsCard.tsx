"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Button from "../Button/Button";
// import CustomerReviewsBg from "@/app/assets/Images/CustomerReviewsBg.webp";
// import Slider from "react-slick";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Slider from "react-slick";
import PdfImg from "@/app/assets/Images/pdfImg.webp";
import EyeIcon from "@/app/assets/Icons/EyeIcon";
import ReviewStar from "@/app/assets/Icons/ReviewStar";

type Content = {
  customerId?: number;
  review?: string;
};

interface CustomerReviewsCardProps {
  content: Content;
}
const CustomerReviewsCard: FC<CustomerReviewsCardProps> = ({ content }) => {
  const { breakpoint } = useBreakpoint();
  return (
    // <div className="relative bg-primary-300 rounded-xl h-[400px] mx-16 mt-8 mb-5 origin-bottom -rotate-[8deg] ">
    <div className="md:container flex justify-center items-center customerReviewsCardWrap">
      <div className="bg-primary-300 rounded-xl xl:h-[400px] mt-8 mb-5 pr-5 origin-bottom xl:-rotate-[8deg] -rotate-[6deg] ">
        <div
          className={`p-4 relative bg-white rounded-md h-full xl:max-w-[309px] origin-bottom xl:rotate-[8deg] rotate-[6deg] border border-[#D6D6D8] customerReviewsCard`}
        >
          {/* <div className="p-4 relative bg-white rounded-md w-[309px] h-full origin-bottom rotate-[8deg] border border-[#D6D6D8]"> */}
          <div>
            <h2 className="sm:text-lg">Customer Id: {content.customerId}</h2>
          </div>
          <div className="flex items-center">
            <div className="w-5">
              <ReviewStar />
            </div>
            <div className="w-5">
              <ReviewStar />
            </div>
            <div className="w-5">
              <ReviewStar />
            </div>
            <div className="w-5">
              <ReviewStar />
            </div>
            <div className="w-5">
              <ReviewStar />
            </div>
          </div>
          <div className="h-0.5 w-full bg-primary-300 my-6"></div>
          <div className="mb-4">
            <p className="sm:text-lg text-sm">{content.review}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewsCard;
