"use client";

import Image, { StaticImageData } from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import userImg from "@/app/assets/Images/userImg.png";

interface AiHeroProps {
  heroContent: {
    mainHeading: string;
    description: string;
    buttonText: string;
  };
  imgSection: {
    img: StaticImageData;
  };
}

const AiHero: FC<AiHeroProps> = ({ heroContent, imgSection }) => {
  const testimonials = Array.from({ length: 3 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
        }
      },
      { threshold: 0.1 }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="bg-gradient-to-b from-white to-[#f8f9ff] pt-20 overflow-hidden"
    >
      <div className="mx-auto flex w-full flex-col pb-24 px-5 sm:px-10 xl:container xl:px-10">
        <h1
          className={`mb-[31px] text-center text-4xl font-medium leading-tight text-[#101828] sm:text-5xl lg:text-[62px] lg:leading-[1.05] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dangerouslySetInnerHTML={{
            __html: heroContent.mainHeading,
          }}
        />
        <div
          className={`mx-auto mb-10 max-w-[1038px] text-center transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-base text-[#333333] sm:text-lg">
            {heroContent.description}
          </p>
        </div>
        <div
          className={`flex flex-col items-center transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <button className="group mx-auto mb-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#323dd6] to-[#535ced] px-[21px] py-[11px] text-[18px] font-medium text-white shadow-lg shadow-[#323dd6]/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2a36b9] hover:to-[#4a52d4] hover:shadow-xl hover:shadow-[#323dd6]/40 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6]">
            <span className="relative z-10">{heroContent.buttonText}</span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#535ced] to-[#323dd6] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          </button>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex -space-x-3">
              {testimonials.map((_, index) => (
                <Image
                  key={index}
                  src={userImg}
                  alt="User avatar"
                  className="inline-block h-10 w-10 rounded-full border-2 border-white object-cover shadow-md transition-transform duration-300 hover:scale-110 hover:z-10"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-[#333333] sm:text-base">
              Loved by over 5 million academics
            </span>
          </div>
        </div>
      </div>
      <div
        ref={imageRef}
        className="mx-auto flex w-full justify-center px-5 sm:px-10 xl:container xl:px-10"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#323dd6] to-[#535ced] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          <Image
            src={imgSection.img}
            alt="Ai Hero"
            className="relative h-auto w-full max-w-[1100px] rounded-xl transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 1100px"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default AiHero;
