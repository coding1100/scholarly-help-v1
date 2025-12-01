"use client";

import { FC } from "react";
import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Icons & Images
import Trustpilot from "@/app/assets/Images/Trustpilot.webp";
import StarGroup from "@/app/assets/Images/starGroup.png";

// Desktop Reviews
import Review1 from "@/app/assets/Images/reviews/1.png";
import Review2 from "@/app/assets/Images/reviews/2.png";
import Review3 from "@/app/assets/Images/reviews/3.png";
import Review4 from "@/app/assets/Images/reviews/4.png";
import Review5 from "@/app/assets/Images/reviews/5.png";
import Review6 from "@/app/assets/Images/reviews/6.png";
import Review7 from "@/app/assets/Images/reviews/7.png";
import Review8 from "@/app/assets/Images/reviews/8.png";
import Review9 from "@/app/assets/Images/reviews/9.png";
import Review10 from "@/app/assets/Images/reviews/10.png";

// Mobile Reviews
import mobileReview1 from "@/app/assets/Images/mobileReviews/1.png";
import mobileReview2 from "@/app/assets/Images/mobileReviews/2.png";
import mobileReview3 from "@/app/assets/Images/mobileReviews/3.png";
import mobileReview4 from "@/app/assets/Images/mobileReviews/4.png";
import mobileReview5 from "@/app/assets/Images/mobileReviews/5.png";
import mobileReview6 from "@/app/assets/Images/mobileReviews/6.png";
import mobileReview7 from "@/app/assets/Images/mobileReviews/7.png";
import mobileReview8 from "@/app/assets/Images/mobileReviews/8.png";
import mobileReview9 from "@/app/assets/Images/mobileReviews/9.png";
import mobileReview10 from "@/app/assets/Images/mobileReviews/10.png";
import mobileReview11 from "@/app/assets/Images/mobileReviews/11.png";
import mobileReview12 from "@/app/assets/Images/mobileReviews/12.png";
import mobileReview13 from "@/app/assets/Images/mobileReviews/13.png";
import mobileReview14 from "@/app/assets/Images/mobileReviews/14.png";
import mobileReview15 from "@/app/assets/Images/mobileReviews/15.png";
import mobileReview16 from "@/app/assets/Images/mobileReviews/16.png";
import mobileReview17 from "@/app/assets/Images/mobileReviews/17.png";
import mobileReview19 from "@/app/assets/Images/mobileReviews/19.png";
import mobileReview20 from "@/app/assets/Images/mobileReviews/20.png";
import mobileReview21 from "@/app/assets/Images/mobileReviews/21.png";
import mobileReview22 from "@/app/assets/Images/mobileReviews/22.png";
import mobileReview23 from "@/app/assets/Images/mobileReviews/23.png";
import mobileReview24 from "@/app/assets/Images/mobileReviews/24.png";
import mobileReview25 from "@/app/assets/Images/mobileReviews/25.png";
import mobileReview26 from "@/app/assets/Images/mobileReviews/26.png";
import mobileReview27 from "@/app/assets/Images/mobileReviews/27.png";
import mobileReview28 from "@/app/assets/Images/mobileReviews/28.png";
import mobileReview29 from "@/app/assets/Images/mobileReviews/29.png";
import mobileReview30 from "@/app/assets/Images/mobileReviews/30.png";
import mobileReview32 from "@/app/assets/Images/mobileReviews/32.png";
import mobileReview33 from "@/app/assets/Images/mobileReviews/33.png";
import mobileReview35 from "@/app/assets/Images/mobileReviews/34.png";
import mobileReview36 from "@/app/assets/Images/mobileReviews/35.png";
import mobileReview37 from "@/app/assets/Images/mobileReviews/36.png";
import mobileReview38 from "@/app/assets/Images/mobileReviews/37.png";
import mobileReview39 from "@/app/assets/Images/mobileReviews/38.png";
import mobileReview40 from "@/app/assets/Images/mobileReviews/39.png";
import mobileReview42 from "@/app/assets/Images/mobileReviews/41.png";
import mobileReview43 from "@/app/assets/Images/mobileReviews/42.png";
import mobileReview44 from "@/app/assets/Images/mobileReviews/43.png";
import mobileReview45 from "@/app/assets/Images/mobileReviews/44.png";
import mobileReview46 from "@/app/assets/Images/mobileReviews/45.png";
import mobileReview47 from "@/app/assets/Images/mobileReviews/46.png";
import mobileReview50 from "@/app/assets/Images/mobileReviews/49.png";
import mobileReview51 from "@/app/assets/Images/mobileReviews/50.png";
import mobileReview52 from "@/app/assets/Images/mobileReviews/51.png";
import mobileReview53 from "@/app/assets/Images/mobileReviews/52.png";
import mobileReview54 from "@/app/assets/Images/mobileReviews/53.png";
import mobileReview55 from "@/app/assets/Images/mobileReviews/54.png";
import mobileReview56 from "@/app/assets/Images/mobileReviews/55.png";
import mobileReview57 from "@/app/assets/Images/mobileReviews/56.png";
import mobileReview58 from "@/app/assets/Images/mobileReviews/57.png";
import mobileReview59 from "@/app/assets/Images/mobileReviews/58.png";
import mobileReview60 from "@/app/assets/Images/mobileReviews/59.png";
import mobileReview61 from "@/app/assets/Images/mobileReviews/60.png";
import mobileReview62 from "@/app/assets/Images/mobileReviews/61.png";
import mobileReview63 from "@/app/assets/Images/mobileReviews/62.png";
import mobileReview64 from "@/app/assets/Images/mobileReviews/64.png";
import mobileReview65 from "@/app/assets/Images/mobileReviews/65.png";
import mobileReview66 from "@/app/assets/Images/mobileReviews/66.png";
import mobileReview67 from "@/app/assets/Images/mobileReviews/67.png";
import mobileReview68 from "@/app/assets/Images/mobileReviews/68.png";
import mobileReview69 from "@/app/assets/Images/mobileReviews/69.png";
import mobileReview70 from "@/app/assets/Images/mobileReviews/70.png";

// Content Arrays
const desktopReviews = [
  Review1,
  Review2,
  Review3,
  Review4,
  Review5,
  Review6,
  Review7,
  Review8,
  Review9,
  Review10,
];

const mobileReviews = [
  mobileReview1,
  mobileReview2,
  mobileReview3,
  mobileReview4,
  mobileReview5,
  mobileReview6,
  mobileReview7,
  mobileReview8,
  mobileReview9,
  mobileReview10,
  mobileReview11,
  mobileReview12,
  mobileReview13,
  mobileReview14,
  mobileReview15,
  mobileReview16,
  mobileReview17,
  mobileReview19,
  mobileReview20,
  mobileReview21,
  mobileReview22,
  mobileReview23,
  mobileReview24,
  mobileReview25,
  mobileReview26,
  mobileReview27,
  mobileReview28,
  mobileReview29,
  mobileReview30,
  mobileReview32,
  mobileReview33,
  mobileReview35,
  mobileReview36,
  mobileReview37,
  mobileReview38,
  mobileReview39,
  mobileReview40,
  mobileReview42,
  mobileReview43,
  mobileReview44,
  mobileReview45,
  mobileReview46,
  mobileReview47,
  mobileReview50,
  mobileReview51,
  mobileReview52,
  mobileReview53,
  mobileReview54,
  mobileReview55,
  mobileReview56,
  mobileReview57,
  mobileReview58,
  mobileReview59,
  mobileReview60,
  mobileReview61,
  mobileReview62,
  mobileReview63,
  mobileReview64,
  mobileReview65,
  mobileReview66,
  mobileReview67,
  mobileReview68,
  mobileReview69,
  mobileReview70,
];

interface CustomerReviewsProps {
  btnText?: string;
}

const CustomerReviews: FC<CustomerReviewsProps> = ({
  btnText = "Place an Order Now",
}) => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 8000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          arrows: false,
          dots: false,
        },
      },
    ],
  };

  return (
    <div className="bg-white text-[#171717] w-full">
      <div className="max-w-screen-xl mx-auto pt-2 pb-3 px-4">
        {/* Header */}
        <h2 className="md:text-5xl text-2xl font-bold text-primary-500 text-center">
          How Students Rate Us!
        </h2>
        <p className="md:text-5xl text-2xl text-[#00B67A] text-center mt-2">
          Excellent
        </p>

        {/* Trustpilot Rating */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <div className="flex items-end gap-1">
            <Image src={Trustpilot} alt="Trustpilot" className="md:w-10 w-8" />
            <p className="md:text-3xl text-xl font-bold">Trustpilot</p>
          </div>
          <Image src={StarGroup} alt="5 Stars" className="max-w-32" />
        </div>
        <p className="text-[#7d7d7d] text-center mt-2">
          Rated 4.6/5 Based on 1000+ Reviews
        </p>

        {/* Desktop Slider */}
        <div className="my-8 md:block hidden">
          <Slider {...settings}>
            {desktopReviews.map((review, index) => (
              <div key={index} className="px-2">
                <Image
                  src={review}
                  alt={`Review ${index + 1}`}
                  className="w-full"
                  priority={index < 3}
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Mobile Slider */}
        <div className="mt-8 md:hidden block">
          <Slider {...settings}>
            {mobileReviews.map((review, index) => (
              <div key={index} className="px-2">
                <Image
                  src={review}
                  alt={`Mobile Review ${index + 1}`}
                  className="w-full"
                  priority={index < 2}
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Optional CTA Button */}
        {/* {btnText && (
          <div className="flex justify-center mt-10">
            <a href="javascript:void(Tawk_API?.toggle())">
              <button className="md:w-64 w-48 py-3 px-6 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 hover:text-white transition-all duration-200 border border-secondary-500">
                {btnText}
              </button>
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CustomerReviews;
