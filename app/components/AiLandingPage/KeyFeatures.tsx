"use client";

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";

interface KeyFeaturesProps {
  featuresSection: {
    subTitle: string;
    heading: string;
    description: string;
    features: {
      heading: string;
      description: string;
      linkText: string;
      url: string;
      img: StaticImageData;
    }[];
  };
}

const KeyFeatures: FC<KeyFeaturesProps> = ({ featuresSection }) => {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(
    new Set()
  );
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    featureRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleFeatures((prev) => new Set(prev).add(index));
            }
          },
          { threshold: 0.2 }
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
    <section className="bg-white dark:bg-[#0a0a0f] pt-20 transition-colors duration-300">
      <div className="mx-auto flex w-full flex-col pb-24 px-5 text-center sm:px-10 xl:container xl:px-10">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[4px] text-[#8953e6] dark:text-[#a78bfa] animate-fade-in">
          {featuresSection.subTitle}
        </p>
        <p
          className="mb-4 text-center text-[32px] font-medium leading-[40px] text-[#1e2938] dark:text-gray-100 sm:text-[36px] sm:leading-[44px] lg:text-[40px] lg:leading-[48px] animate-fade-in"
          dangerouslySetInnerHTML={{
            __html: featuresSection.heading,
          }}
        />
        <p className="mx-auto mb-16 max-w-[922px] text-center text-base text-[#364153] dark:text-gray-300 sm:text-lg lg:mb-20 animate-fade-in">
          {featuresSection.description}
        </p>
        {featuresSection.features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => {
              featureRefs.current[index] = el;
            }}
            className={`mx-auto mb-16 grid max-w-[1100px] grid-cols-1 items-center gap-10 text-left sm:gap-12 lg:mb-32 lg:grid-cols-2 lg:gap-14 lg:last:mb-0 transition-all duration-1000 ${
              visibleFeatures.has(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{
              transitionDelay: `${index * 150}ms`,
            }}
          >
            <div
              className={`space-y-4 sm:space-y-5 ${
                index % 2 === 1 ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <p className="text-2xl font-medium text-[#1E2938] dark:text-gray-100 lg:text-[28px] transition-colors duration-300 hover:text-[#8953e6] dark:hover:text-[#a78bfa]">
                {feature.heading}
              </p>
              <p className="text-base text-[#364153] dark:text-gray-300 sm:text-lg leading-relaxed">
                {feature.description}
              </p>
              <Link
                href={feature.url}
                className="group inline-flex items-center gap-2 text-[#1722be] dark:text-[#818cf8] font-medium transition-all duration-300 hover:text-[#8953e6] dark:hover:text-[#a78bfa] hover:gap-3"
              >
                <span>{feature.linkText}</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div
              className={`flex justify-center group ${
                index % 2 === 1 ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg dark:shadow-[#8953e6]/20 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[#8953e6]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8953e6]/20 to-[#323dd6]/20 dark:from-[#8953e6]/30 dark:to-[#323dd6]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <Image
                  src={feature.img}
                  alt={feature.heading}
                  className="h-auto w-full max-w-[520px] rounded-xl object-cover transition-transform duration-700 group-hover:scale-110 dark:opacity-90"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default KeyFeatures;
