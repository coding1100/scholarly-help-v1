"use client";

// app/components/GuaranteeSection.tsx
import Image from "next/image"; // optional – replace with your own button

// Import the icons (replace with your actual image paths or use SVG icons)
import IconZeroDetection from "@/app/assets/Icons/zero-detection.png";
import IconGrade from "@/app/assets/Icons/grade.png";
import IconConfidentiality from "@/app/assets/Icons/confidentiality.png";
import IconOnTime from "@/app/assets/Icons/on-time.png";
import IconQuality from "@/app/assets/Icons/quality.png";
import IconMoneyBack from "@/app/assets/Icons/money-back.png";
import FadeBorder from "@/app/assets/Icons/fade-border.svg";
import { GiPositionMarker } from "react-icons/gi";

interface GuaranteeItem {
  title: React.ReactNode;
  icon: React.ReactNode;
}

export default function GuaranteeSection() {
  const scrollToQuote = () => {
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const guarantees: GuaranteeItem[] = [
    {
      title: (
        <>
          {" "}
          Zero-Detection <br /> Guarantee{" "}
        </>
      ),
      icon: (
        <Image
          src={IconZeroDetection}
          alt="Zero Detection"
          className="w-25 h-25"
        />
      ),
    },
    {
      title: (
        <>
          {" "}
          Grade <br /> Guarantee{" "}
        </>
      ),
      icon: (
        <Image src={IconGrade} alt="Grade Guarantee" className="w-25 h-25" />
      ),
    },
    {
      title: (
        <>
          {" "}
          Complete <br /> Confidentiality{" "}
        </>
      ),
      icon: (
        <Image
          src={IconConfidentiality}
          alt="Confidentiality"
          className="w-25 h-25"
        />
      ),
    },
    {
      title: (
        <>
          {" "}
          On-Time <br /> Delivery{" "}
        </>
      ),
      icon: (
        <Image src={IconOnTime} alt="On-Time Delivery" className="w-25 h-25" />
      ),
    },
    {
      title: (
        <>
          {" "}
          Quality <br /> Assurance{" "}
        </>
      ),
      icon: (
        <Image
          src={IconQuality}
          alt="Quality Assurance"
          className="w-25 h-25"
        />
      ),
    },
    {
      title: (
        <>
          {" "}
          Money-Back <br /> Guarantee{" "}
        </>
      ),
      icon: (
        <Image
          src={IconMoneyBack}
          alt="Money-Back Guarantee"
          className="w-25 h-25"
        />
      ),
    },
  ];

  return (
    <section className="w-full relative overflow-hidden mt-[60px] mb-[30px]  bg-white text-[#171717] max-[1320px]:px-8">
      <div className="mx-auto w-full max-w-7xl pt-3 pb-10 flex relative justify-between max-[1080px]:flex-col">
        {/* Header */}
        <div className="text-left mb-12 mt-10 w-[28%] max-[1080px]:w-[100%]">
          <h2 className="text-[42px] text-primary-500 font-bold  leading-[120%] tracking-[0] mb-[30px]">
            We&apos;ve Got You Covered — Guaranteed!
          </h2>
          <p className="font-poppins font-normal sm:text-[17px] text-sm leading-[1.5] tracking-[0] mb-[30px]">
            Your success is our mission. We back every service with guarantees
            that protect your grades, your investment, and your peace of mind.
          </p>
          <button
            onClick={scrollToQuote}
            className="sm:mx-0 mx-auto rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] md:w-64 w-48"
          >
            Take my online class
          </button>
        </div>

        {/* Guarantees Grid */}
        <div className="relative w-[72%] pl-[60px] max-[992px]:pl-[0px] max-[1080px]:w-[100%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            <Image
              src={FadeBorder}
              alt="Money-Back Guarantee"
              className="absolute w-full h-full left-[15px] top-[8px] max-[1025px]:hidden"
            />
            {guarantees.map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center text-center space-y-3 p-[20px] py-[25px]"
              >
                <div className="flex justify-center items-center w-24 h-24">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Optional soft fade at the grid’s outer right edge */}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
