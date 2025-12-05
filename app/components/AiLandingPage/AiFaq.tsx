"use client";

import { FC, useEffect, useRef, useState } from "react";

interface AiFaqProps {
  FaqSestion: {
    subTitle: string;
    heading: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };
}

const AiFaq: FC<AiFaqProps> = ({ FaqSestion }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleFaqs, setVisibleFaqs] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    faqRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleFaqs((prev) => new Set(prev).add(index));
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section ref={sectionRef} className="bg-white dark:bg-[#0a0a0f] pt-20 transition-colors duration-300">
      <div className="mx-auto pb-24 px-5 sm:px-10 xl:container xl:px-10">
        <p
          className={`text-[#8953e6] dark:text-[#a78bfa] text-xs text-center uppercase tracking-[4px] font-semibold mb-4 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {FaqSestion.subTitle}
        </p>
        <p
          className={`text-[40px] leading-[48px] font-medium text-[#1e2938] dark:text-gray-100 text-center mb-4 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dangerouslySetInnerHTML={{
            __html: FaqSestion.heading,
          }}
        />
        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {FaqSestion.faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={faq.question}
                ref={(el) => {
                  faqRefs.current[index] = el;
                }}
                className={`group rounded-2xl bg-white dark:bg-[#1a1a2e] shadow-[0px_12px_24px_rgba(30,41,56,0.06)] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0px_16px_32px_rgba(30,41,56,0.12)] dark:hover:shadow-[0px_16px_32px_rgba(137,83,230,0.2)] hover:-translate-y-1 ${
                  visibleFaqs.has(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                } ${
                  isOpen
                    ? "ring-2 ring-[#8953e6]/20 dark:ring-[#a78bfa]/30 shadow-[0px_16px_32px_rgba(137,83,230,0.15)] dark:shadow-[0px_16px_32px_rgba(167,139,250,0.25)]"
                    : ""
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-300 hover:bg-[#f8f9ff] dark:hover:bg-[#252540] rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="text-lg font-semibold leading-7 text-[#1E2938] dark:text-gray-100 transition-colors duration-300 group-hover:text-[#8953e6] dark:group-hover:text-[#a78bfa]">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E7EC] dark:border-gray-700 text-[#8953e6] dark:text-[#a78bfa] transition-all duration-300 ease-in-out group-hover:bg-[#8953e6] dark:group-hover:bg-[#a78bfa] group-hover:text-white group-hover:border-[#8953e6] dark:group-hover:border-[#a78bfa] ${
                      isOpen
                        ? "rotate-180 bg-[#8953e6] dark:bg-[#a78bfa] text-white border-[#8953e6] dark:border-[#a78bfa]"
                        : ""
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-panel-${index}`}
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-base leading-7 text-[#4B5563] dark:text-gray-300 animate-fade-in">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default AiFaq;
