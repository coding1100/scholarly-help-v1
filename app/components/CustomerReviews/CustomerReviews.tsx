"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Button from "../Button/Button";
import SampleBg from "@/app/assets/Images/sampleBg.webp";
// import Slider from "react-slick";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Slider from "react-slick";
import SampleCard from "./CustomerReviewsCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import "./index.css";
import {
  customerReviewsCardContent,
  desktopReviews,
  mobileReviews,
} from "./content";
import Trustpilot from "@/app/assets/Images/Trustpilot.webp";
import StarGroup from "@/app/assets/Images/starGroup.png";
// type Content = {
//   icon?: any;
//   title?: string;
//   description?: string;
//   isLast?: boolean;
// };

interface CustomerReviewsProps {
  // content: Content[];
  btnText?: string;
}
const CustomerReviews: FC<CustomerReviewsProps> = ({ btnText }) => {
  const { breakpoint } = useBreakpoint();
  const isDesktop = breakpoint === "lg" || breakpoint === "xl";

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    dots: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          // arrows: false,
        },
      },
      // {
      //   breakpoint: 1024,
      //   settings: {
      //     slidesToShow: 2,
      //     slidesToScroll: 2,
      //     infinite: true,
      //     dots: false,
      //   },
      // },

      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: false,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: false,
          arrows: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: false,
          arrows: false,
        },
      },
    ],
  };

  return (
    // <div
    //   // className="flex justify-center py-8 relative bg-primary-100"
    //   className="sm:py-14 py-8 relative bg-primary-100"
    // >
    //   {/* <div className="container 2xl:px-16 lg:px-10 z-10"> */}
    //   <div className="z-10 customerReviewsWrap">
    //     <div>
    //       <h2 className="font-bold text-primary-500 text-center text-[42px]  mb-3">
    //         Customer Reviews
    //       </h2>
    //       <p className="md:text-xl text-primary-500 text-center mt-6">
    //         15000+ Customers’ genuine feedback with the ratings of 4.9/5
    //       </p>
    //     </div>
    //     <div className="pt-12 sm:pb-12">
    //       <Slider {...settings} className="testimonials">
    //         {customerReviewsCardContent.map((item, index) => (
    //           <div key={index} className="flex justify-center">
    //             <SampleCard content={item} />
    //           </div>
    //         ))}
    //       </Slider>
    //     </div>
    //     <div className="flex justify-center md:mt-8">
    //       <a href="javascript:void(Tawk_API.toggle())">
    //         <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
    //           {btnText ? `${btnText}` : "Place an Order Now"}
    //         </Button>
    //       </a>
    //     </div>
    //   </div>
    // </div>
    <div className="container mx-auto sm:py-14 py-8 ">
      <h2 className="font-bold text-primary-500 text-center text-[42px]  mb-3">
        How Student Rate Us!
      </h2>
      <p className="md:text-5xl text-2xl text-[#00B67A] text-center">
        Excellent
      </p>
      <div className="flex justify-center items-center gap-2">
        <div className="flex justify-center items-end gap-1">
          <Image src={Trustpilot} alt="Trustpilot" className="md:w-10 w-8" />
          <p className="md:text-3xl text-xl font-bold">Trustpilot</p>
        </div>
        <Image src={StarGroup} alt="Trustpilot" className="max-w-32" />
      </div>
      <p className="text-[#7d7d7d] text-center mt-2">
        Rated 4.6/5 Based on 1000+ Reviews
      </p>
      <div className="my-5 md:block hidden">
        <Slider {...settings}>
          {desktopReviews.map((item, index) => (
            <div key={index} className="w-full">
              {/* <div key={index} className="flex justify-center"> */}
              <Image src={item} alt="review" className="w-[90%] mx-auto" />
            </div>
          ))}
        </Slider>
      </div>
      <div className="mt-5 md:hidden block">
        <Slider {...settings}>
          {mobileReviews.map((item, index) => (
            <div key={index} className="w-full">
              {/* <div key={index} className="flex justify-center"> */}
              <Image src={item} alt="review" className="w-[90%] mx-auto" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CustomerReviews;
