"use client";

import Image, { StaticImageData } from "next/image";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

interface AiTrustProps {
  trustSection: {
    heading: string;
    description: string;
    sliderImgs: StaticImageData[];
  };
}

const AiTrust: FC<AiTrustProps> = ({ trustSection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const settings = useMemo(
    () => ({
      infinite: true,
      autoplay: true,
      autoplaySpeed: 0,
      speed: isHovered ? 12000 : 5000,
      cssEase: "linear" as const,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      pauseOnHover: false,
      responsive: [
        {
          breakpoint: 1280,
          settings: { slidesToShow: 3 },
        },
        {
          breakpoint: 992,
          settings: { slidesToShow: 3 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2 },
        },
        {
          breakpoint: 640,
          settings: { slidesToShow: 1 },
        },
        {
          breakpoint: 480,
          settings: { slidesToShow: 1 },
        },
      ],
    }),
    [isHovered]
  );

  const filterStyle: CSSProperties = {
    filter:
      "brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(8%) hue-rotate(175deg) brightness(95%) contrast(85%)",
  };

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-[#f8f9ff] to-white pt-20"
    >
      <div className="mx-auto flex w-full flex-col pb-24 px-5 text-center sm:px-10 xl:container xl:px-10">
        <p
          className={`mb-4 text-xl font-medium text-[#1e2938] sm:text-2xl transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {trustSection.heading}
        </p>
        <p
          className={`mb-9 text-sm text-[#333333] sm:text-base lg:text-lg transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {trustSection.description}
        </p>
        <div
          className={`mx-auto mt-10 w-full max-w-[900px] transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none"></div>
            <Slider {...settings}>
              {trustSection.sliderImgs.map((image, index) => (
                <div
                  key={index}
                  className="flex h-full items-center justify-center px-4 py-2"
                >
                  <div className="transition-transform duration-300 hover:scale-110">
                    <Image
                      src={image}
                      alt="Trusted institution logo"
                      className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      style={filterStyle}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiTrust;
