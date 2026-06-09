"use client";

import Image, { StaticImageData } from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import userImg from "@/app/assets/Images/userImg.png";
import Link from "next/link";
import CgpaTool from "../AiTools/CgpaTool/CgpaTool";
import { usePathname } from "next/navigation";

interface AiHeroProps {
  heroContent: {
    mainHeading: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
  imgSection: {
    img: StaticImageData;
  };
}

const AiHero: FC<AiHeroProps> = ({ heroContent, imgSection }) => {
  const testimonials = Array.from({ length: 3 });
  const [isVisible, setIsVisible] = useState(false);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(true);
  const [isMdUp, setIsMdUp] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const currentPage = usePathname();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
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
      { threshold: 0.1 },
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mql.matches);
    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  useEffect(() => {
    const isCgpaLanding =
      currentPage === "/cgpa-calculator" || currentPage === "/cgpa-calculator/";
    if (!isCgpaLanding) return;

    const target = calculatorRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCalculatorVisible(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [currentPage]);

  return (
    <section
      ref={heroRef}
      className="bg-gradient-to-b from-white to-[#f8f9ff] dark:from-[#0a0a0f] dark:to-[#1a1a2e] md:pt-20 pt-5 overflow-hidden transition-colors duration-300"
    >
      <div className="mx-auto flex w-full flex-col pb-24 px-5 sm:px-10 xl:container xl:px-10">
        <h1
          className={`sm:mb-[31px] mb-5 text-center text-3xl font-medium leading-tight text-[#101828] dark:text-gray-100 sm:text-5xl lg:text-[62px] lg:leading-[1.05] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dangerouslySetInnerHTML={{
            __html: heroContent.mainHeading,
          }}
        />
        {heroContent.description && (
          <div
            className={`mx-auto md:mb-0 mb-5 max-w-[1038px] text-center transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p
              className="text-base text-[#333333] dark:text-gray-300 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: heroContent.description }}
            />
          </div>
        )}
        {(currentPage === "/cgpa-calculator" ||
          currentPage === "/cgpa-calculator/") && (
          <div ref={calculatorRef}>
            <CgpaTool gateResults persistState={false} neverShowResultsOnPage />
          </div>
        )}
        <div
          className={`flex flex-col items-center transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {currentPage !== "/cgpa-calculator/" && (
            <>
              <Link
                href={heroContent.buttonUrl}
                className="group mx-auto mb-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#323dd6] to-[#535ced] px-[21px] py-[11px] text-[18px] font-medium text-white shadow-lg shadow-[#323dd6]/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2a36b9] hover:to-[#4a52d4] hover:shadow-xl hover:shadow-[#323dd6]/40 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6] relative"
              >
                <span className="relative z-10">{heroContent.buttonText}</span>
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#535ced] to-[#323dd6] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              </Link>
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
                <span className="text-sm font-medium text-[#333333] dark:text-gray-300 sm:text-base">
                  Loved by over 5 million academics
                </span>
              </div>{" "}
            </>
          )}
        </div>
      </div>
      {currentPage !== "/cgpa-calculator/" && (
        <div
          ref={imageRef}
          className="mx-auto flex w-full justify-center px-5 sm:px-10 xl:container xl:px-10"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#323dd6] to-[#535ced] rounded-2xl blur opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src={imgSection.img}
              alt="Ai Hero"
              className="relative h-auto w-full max-w-[1100px] rounded-xl transition-transform duration-700 group-hover:scale-[1.02] dark:opacity-90"
              sizes="(max-width: 1024px) 100vw, 1100px"
              priority
            />
          </div>
        </div>
      )}

      {(currentPage === "/cgpa-calculator" ||
        currentPage === "/cgpa-calculator/") &&
      !isMdUp &&
      !isCalculatorVisible ? (
        <div className="fixed bottom-3 left-0 right-0 z-50 px-4 md:hidden">
          <button
            type="button"
            onClick={() => {
              calculatorRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="mx-auto flex w-full max-w-md items-center justify-center rounded-xl bg-gradient-to-r from-[#323dd6] to-[#535ced] px-4 py-3 text-base font-medium text-white shadow-lg shadow-[#323dd6]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6]"
          >
            Get Free CGPA Email
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default AiHero;
