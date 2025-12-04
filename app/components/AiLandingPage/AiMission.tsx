"use client";

import { FC, useEffect, useRef, useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { PiNotePencilDuotone, PiLightbulbDuotone } from "react-icons/pi";
import { GrMagic } from "react-icons/gr";
import { IconType } from "react-icons";

// Icon mapping from string identifiers to icon components
const iconMap: Record<string, IconType> = {
  IoCheckmarkCircle,
  PiNotePencilDuotone,
  PiLightbulbDuotone,
  GrMagic,
};

interface AiMissionProps {
  missionSection: {
    subTitle: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
  guideSection: {
    subTitle: string;
    heading: string;
    description: string;
    steps: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
}

const AiMission: FC<AiMissionProps> = ({ missionSection, guideSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleSteps((prev) => new Set(prev).add(index));
            }
          },
          { threshold: 0.3 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-[#f8f9ff] pt-20"
    >
      <div className="mx-auto flex w-full flex-col pb-24 px-5 sm:px-10 xl:container xl:px-10">
        <p
          className={`mb-4 text-center text-xs font-semibold uppercase tracking-[4px] text-[#8953e6] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {missionSection.subTitle}
        </p>
        <p
          className={`mb-4 text-center text-[32px] font-medium leading-[40px] text-[#1e2938] sm:text-[36px] sm:leading-[44px] lg:text-[40px] lg:leading-[48px] transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dangerouslySetInnerHTML={{
            __html: missionSection.heading,
          }}
        />
        <p
          className={`mx-auto mb-10 max-w-[922px] text-center text-base text-[#364153] sm:text-lg transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {missionSection.description}
        </p>

        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {guideSection.steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className={`group space-y-2 rounded-xl px-6 py-6 bg-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                visibleSteps.has(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative">
                {(() => {
                  const IconComponent = iconMap[step.icon];
                  return IconComponent ? (
                    <IconComponent className="text-2xl text-[#535ced] sm:text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  ) : null;
                })()}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8953e6]/20 to-[#323dd6]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
              <p className="text-xl font-medium text-[#1E2938] sm:text-2xl transition-colors duration-300 group-hover:text-[#535ced]">
                {step.title}
              </p>
              <p className="text-sm text-[#697282] sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div
          className={`flex flex-col items-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <button className="group mx-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#323dd6] to-[#535ced] px-[21px] py-[11px] text-[18px] font-medium text-white shadow-lg shadow-[#323dd6]/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2a36b9] hover:to-[#4a52d4] hover:shadow-xl hover:shadow-[#323dd6]/40 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323dd6]">
            <span className="relative z-10">{missionSection.buttonText}</span>
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#535ced] to-[#323dd6] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
          </button>
        </div>
      </div>
    </section>
  );
};
export default AiMission;
