"use client";

import { FC, useEffect, useRef, useState } from "react";

interface ElevateWritingProps {
  elevateSection: {
    heading: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
}

const ElevateWriting: FC<ElevateWritingProps> = ({ elevateSection }) => {
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

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-[#f8f9ff] to-white pt-20 overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8953e6]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#323dd6]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative mx-auto flex w-full flex-col pb-24 px-5 sm:px-10 xl:container xl:px-10">
        <h1
          className={`mb-6 text-center text-[32px] font-medium leading-[40px] text-[#101828] sm:text-[36px] sm:leading-[44px] lg:mb-[31px] lg:text-[40px] lg:leading-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dangerouslySetInnerHTML={{
            __html: elevateSection.heading,
          }}
        />
        <div
          className={`mx-auto mb-10 max-w-[600px] text-center transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-base text-[#333333] sm:text-lg leading-relaxed">
            {elevateSection.description}
          </p>
        </div>
        <div
          className={`flex flex-col items-center transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <button className="group relative mx-auto mb-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#323dd6] to-[#535ced] px-[21px] py-[11px] text-[18px] font-medium text-white shadow-lg shadow-[#323dd6]/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2a36b9] hover:to-[#4a52d4] hover:shadow-xl hover:shadow-[#323dd6]/40 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6] overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              {elevateSection.buttonText}
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#535ced] to-[#323dd6] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <span className="absolute inset-0 rounded-xl bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
          </button>
        </div>
      </div>
    </section>
  );
};
export default ElevateWriting;
