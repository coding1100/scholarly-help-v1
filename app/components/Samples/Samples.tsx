"use client";

import { FC } from "react";
import Button from "../Button/Button";
import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import Slider from "react-slick";
import SampleCard from "./SampleCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";
import SampleBg from "@/app/assets/Images/sampleBg.webp";
import { sampleCardContent } from "./content";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SamplesProps {
  btnText?: string;
}
const Samples: FC<SamplesProps> = ({ btnText }) => {
  const { breakpoint } = useBreakpoint();
  const isDesktop = breakpoint === "lg" || breakpoint === "xl";
  const currentPage = usePathname();
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    dots: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
          arrows: false,
        },
      },

      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div
      className="py-28 relative bg-primary-500 xl:flex justify-center bg-sample"
      // style={{ backgroundImage: `url(${SampleBg.src})` }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-primary-500 opacity-90"></div>
      <div className="xl:container 2xl:px-10 z-10 relative xl:px-5 samplesWrap">
        <div>
          <h2 className="md:text-5xl sm:text-3xl text-2xl font-bold text-white text-center">
            Our Samples
          </h2>
        </div>
        <div className="py-12 xl:px-14">
          <Slider {...settings} className="samplesSlider">
            {sampleCardContent.map((item, index) => (
              <div
                key={index}
                className="flex justify-center duration-1000 hover:-translate-y-6"
              >
                <SampleCard content={item} />
              </div>
            ))}
          </Slider>
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

export default Samples;
