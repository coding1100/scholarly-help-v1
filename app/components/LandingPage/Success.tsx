// app/components/ThreeDCarousel.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
const proof5 = "/images/proof-3.webp";
const proof1 = "/images/proof-2.webp";
const proof2 = "/images/proof-2.webp";
const proof4 = "/images/proof-3.webp";

export default function ThreeDCarousel() {
  const scrollToQuote = () => {
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [active, setActive] = useState(0);

  const slides = [
    { id: 0, image: proof1 },
    { id: 1, image: proof2 },
    { id: 2, image: proof4 },
    { id: 2, image: proof5 },
  ];

  // Auto-slide every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="pt-9 pb-20 px-5 overflow-hidden bg-gray-50 text-[#171717]">
      <div className="max-w-6xl max-[992px]:max-w-4xl mx-auto">
        <div className="py-10 ">
          <h2 className="sm:text-[42px] text-[32px] sm:font-bold font-semibold text-center">
            What Success Looks Like
          </h2>
          <p className="sm:text-[18px] text-sm text-center">
            From exams and essays to full-class management, we handle it all so
            you don’t have to.
          </p>
        </div>
        <div
          className="relative max-[992px]:h-[400px] max-[768px]:h-[250px] max-[480px]:h-[150px] lg:h-[500px]"
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
        >
          {slides.map((slide, i) => {
            const next = (active + 1) % slides.length;
            const prev = (active + slides.length - 1) % slides.length;

            let transform = "";
            let opacity = "opacity-40";

            if (i === active) {
              transform = "translate3d(0,0,0)";
              opacity = "opacity-100";
            } else if (i === next) {
              transform = "translate3d(25%,0,-250px)";
            } else if (i === prev) {
              transform = "translate3d(-25%,0,-250px)";
            } else {
              transform = "translate3d(0,0,-500px)";
              opacity = "opacity-0";
            }

            return (
              <div
                key={i}
                onClick={() => setActive(i)}
                className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${opacity}`}
                style={{ transform }}
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden lg:shadow-2xl">
                  <Image
                    src={slide.image}
                    alt={`Slide ${i + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            );
          })}

          {/* Pagination Dots */}
          <div className="absolute hidden -bottom-12 left-0 right-0 flex justify-center space-x-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === active ? "bg-gray-700 scale-110" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-[60px]">
        <button
          type="button"
          onClick={scrollToQuote}
          className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] md:w-64 w-48"
        >
          Take my online class
        </button>
      </div>
    </section>
  );
}
