"use client";

import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import styles from "./ThankYou.module.css";
import { content } from "./content";
import Trustpilot from "@/app/assets/Images/Trustpilot.webp";
import StarGroup from "@/app/assets/Images/starGroup.png";
import { desktopReviews, mobileReviews } from "../CustomerReviews/content";
import {
  AiChipIcon,
  GraduationCapIcon,
  RatingBadgeIcon,
  HandshakeIcon,
  BooksIcon,
  CheckmarkIcon,
  OrangeUnderlineFlourish,
} from "./ThankYouIcons";

type ThankYouProps = {};

interface WhatsAppButtonProps {
  onClick?: () => void;
  className?: string;
  text?: string;
}

// Responsive WhatsApp CTA Button matching Figma
const WhatsAppButton: FC<WhatsAppButtonProps> = ({
  onClick,
  className = "",
  text = "Whatsapp Now For Quick Quote",
}) => {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=14108445419"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#41A800] hover:bg-[#368F00] active:scale-[0.98] text-white font-bold text-[13px] sm:text-base md:text-[18px] whitespace-nowrap w-full max-w-[480px] h-[48px] sm:h-[56px] md:h-[62px] px-3 sm:px-6 rounded-xl shadow-[0_6px_20px_rgba(65,168,0,0.30)] transition-all duration-200 no-underline cursor-pointer select-none ${className}`}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current flex-shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.277-.101-.478-.15-.679.15-.201.301-.778.98-.954 1.181-.176.201-.351.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.676-2.086-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.679-1.637-.93-2.242-.244-.589-.493-.509-.679-.519l-.578-.01c-.201 0-.527.075-.803.377s-1.055 1.03-1.055 2.512c0 1.482 1.08 2.913 1.231 3.114.15.201 2.125 3.245 5.15 4.551.72.311 1.282.497 1.721.636.724.23 1.382.197 1.902.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.306.176-1.431-.075-.126-.276-.201-.577-.352zm-5.467 7.618h-.008a10.015 10.015 0 01-5.109-1.398l-.366-.217-3.799.996 1.014-3.702-.238-.379a9.998 9.998 0 01-1.534-5.289c0-5.522 4.493-10.015 10.021-10.015 2.675 0 5.19 1.042 7.081 2.934a9.957 9.957 0 012.934 7.08c0 5.523-4.493 10.016-10.019 10.016h.034zm0-18.016c-4.417 0-8.012 3.595-8.012 8.013 0 1.41.368 2.787 1.066 3.996l.255.442-.707 2.581 2.646-.694.428.254a7.986 7.986 0 004.324 1.248c4.417 0 8.013-3.596 8.013-8.013 0-2.14-.833-4.153-2.347-5.667a7.96 7.96 0 00-5.667-2.347z" />
      </svg>
      <span>{text}</span>
      <span className="text-sm sm:text-lg md:text-xl leading-none font-normal ml-0.5">→</span>
    </a>
  );
};

// Custom Chevron Arrows matching Figma
const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Previous slide"
      className="absolute left-[-8px] sm:left-[-30px] md:left-[-44px] top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer text-[#111827] hover:text-[#565ADD] transition-colors duration-200 group"
    >
      <svg
        className="w-4 h-7 sm:w-6 sm:h-10 stroke-current group-hover:scale-105 transition-transform"
        viewBox="0 0 24 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 10L6 24L18 38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Next slide"
      className="absolute right-[-8px] sm:right-[-30px] md:right-[-44px] top-1/2 -translate-y-1/2 z-20 w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer text-[#111827] hover:text-[#565ADD] transition-colors duration-200 group"
    >
      <svg
        className="w-4 h-7 sm:w-6 sm:h-10 stroke-current group-hover:scale-105 transition-transform"
        viewBox="0 0 24 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 10L18 24L6 38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const ThankYou: FC<ThankYouProps> = () => {
  const [GCLID, setGCLID] = useState("");
  const [url, setUrl] = useState("");

  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/order/quote/whatsapp`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.href.includes("gclid=")) {
        setGCLID(window.location.href);
      }
      setUrl(window.location.href);
    }
  }, []);

  const postData = {
    gclid: GCLID,
    url: url,
  };

  const apiCall = async () => {
    try {
      const res = await axios.post(postUrl, postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("WhatsApp Quote API error:", error);
      }
    }
  };

  // Slider settings for Proof of A+ Grades
  const proofSliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    dots: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    autoplay: true,
    autoplaySpeed: 4500,
  };

  // Slider settings for Trustpilot Reviews
  const reviewSliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    dots: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className={`${styles.thankYouRoot} font-poppins bg-white text-[#111827] selection:bg-[#565ADD] selection:text-white`}>
      {/* ===================== HERO SECTION ===================== */}
      <section className="bg-gradient-to-b from-[#F5F2FD] via-[#FAF8FF] to-white pt-5 sm:pt-12 md:pt-16 pb-6 sm:pb-12 md:pb-16">
        <div className="container mx-auto max-w-[1240px] px-3 sm:px-4">
          {/* Top Pill Badge */}
          <div className="flex justify-center mb-3 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white border border-[#ECEAF4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs sm:text-sm font-medium text-[#111827]">
              <AiChipIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#111827]">Request Received Successfully</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-[46px] lg:text-[52px] font-bold text-[#111827] text-center leading-[1.25] md:leading-[1.24] max-w-4xl mx-auto tracking-[-0.02em]">
            <span className="relative inline-block text-[#FF5A00] mr-2 sm:mr-2.5 whitespace-nowrap">
              Thank you!
              <span className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[10px] sm:h-[15px] pointer-events-none">
                <OrangeUnderlineFlourish className="w-full h-full" />
              </span>
            </span>
            <span className="inline">Your personalized</span>
            <br className="hidden md:inline" />{" "}
            <span className="inline">quote is being prepared.</span>
          </h1>

          {/* Subtext */}
          <div className="max-w-[740px] mx-auto text-center mt-3.5 sm:mt-6 space-y-2 sm:space-y-3">
            <p className="text-[#4B5563] text-xs sm:text-base md:text-[17px] leading-[1.6] sm:leading-[1.65] font-normal">
              Our academic support team is reviewing your request right now. Watch{" "}
              <br className="hidden sm:inline" />
              this short video to see what happens next and how to get help faster.
            </p>
            <p className="text-[#111827] text-xs sm:text-[15px] md:text-base font-bold">
              Watch this 2-minute video before your academic specialist contacts you.
            </p>
          </div>

          {/* Video Container (Card Frame Matching Figma) */}
          <div className="w-full max-w-[1040px] mx-auto mt-4 sm:mt-8 md:mt-10">
            <div className="bg-white p-1.5 sm:p-2.5 md:p-3 rounded-2xl md:rounded-[30px] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.12)] border border-[#E5E7EB]">
              <div className="relative aspect-video w-full rounded-xl md:rounded-[22px] overflow-hidden bg-black">
                <iframe
                  className="w-full h-full block"
                  src="https://www.youtube.com/embed/5rSsqxPikBg?rel=0"
                  title="Scholarly Help Welcome Video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Primary CTA + Microcopy + Benefit Checkmarks */}
          <div className="flex flex-col items-center mt-4 sm:mt-8 md:mt-10">
            <WhatsAppButton onClick={apiCall} />
            <p className="text-[11px] sm:text-sm text-[#6B7280] font-medium mt-2 sm:mt-3.5 mb-2.5 sm:mb-4">
              Average response time: under 5 minutes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-8 gap-y-1.5 sm:gap-y-2.5 max-w-2xl text-[11px] sm:text-sm font-semibold text-[#111827]">
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <CheckmarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                No sign-up required
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <CheckmarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                Always Free
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <CheckmarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                100% Private
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <CheckmarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                Non-binding quote
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 3-STEP PROCESS CARDS ===================== */}
      <section className="py-6 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-[1160px] px-3 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#ECEAF4] rounded-2xl p-4 sm:p-7 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-200">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.08em] text-[#9CA3AF] uppercase block mb-1.5 sm:mb-2.5">
                STEP 01
              </span>
              <h3 className="text-base sm:text-lg md:text-[20px] font-bold text-[#111827] mb-1.5 sm:mb-2">
                We Review Your Information
              </h3>
              <p className="text-xs sm:text-sm md:text-[15px] font-normal text-[#6B7280] leading-[1.5] sm:leading-[1.6]">
                Your subject, deadlines, instructions, and requirements are carefully checked.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#ECEAF4] rounded-2xl p-4 sm:p-7 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-200">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.08em] text-[#9CA3AF] uppercase block mb-1.5 sm:mb-2.5">
                STEP 02
              </span>
              <h3 className="text-base sm:text-lg md:text-[20px] font-bold text-[#111827] mb-1.5 sm:mb-2">
                We contact you
              </h3>
              <p className="text-xs sm:text-sm md:text-[15px] font-normal text-[#6B7280] leading-[1.5] sm:leading-[1.6]">
                A support specialist confirms the details and shares your personalized quote.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#ECEAF4] rounded-2xl p-4 sm:p-7 md:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-200">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.08em] text-[#9CA3AF] uppercase block mb-1.5 sm:mb-2.5">
                STEP 03
              </span>
              <h3 className="text-base sm:text-lg md:text-[20px] font-bold text-[#111827] mb-1.5 sm:mb-2">
                Our Expert Gets Started
              </h3>
              <p className="text-xs sm:text-sm md:text-[15px] font-normal text-[#6B7280] leading-[1.5] sm:leading-[1.6]">
                Once confirmed, we match your order to the most qualified academic expert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== URGENT HELP BANNER ===================== */}
      <section className="py-3 sm:py-6 md:py-8">
        <div className="container mx-auto max-w-[1240px] px-3 sm:px-4">
          <div className="rounded-2xl md:rounded-[20px] p-4 sm:p-7 md:p-9 bg-gradient-to-r from-[#7578E3] to-[#565ADD] text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-6 shadow-[0_12px_32px_rgba(86,90,221,0.25)] text-center md:text-left">
            <div className="max-w-xl">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.08em] text-white/80 uppercase block mb-1">
                ACADEMIC DEADLINE AT RISK?
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                Need Urgent Help?
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/95 font-normal">
                Text us on WhatsApp to skip the queue and get your quote instantly.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
              <WhatsAppButton onClick={apiCall} className="md:w-[440px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== 4 STATS / TRUST SECTION ===================== */}
      <section className="bg-[#F4F5FA] py-6 sm:py-14 md:py-20 mt-5 sm:mt-10 md:mt-14">
        <div className="container mx-auto max-w-[1240px] px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {/* Stat 1 */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center border border-[#ECEBF2] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <GraduationCapIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl md:text-[36px] font-extrabold text-[#111827] mt-1 sm:mt-2 md:mt-3">10,000+</p>
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#6B7280] mt-0.5 sm:mt-1.5">Students Supported</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center border border-[#ECEBF2] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <RatingBadgeIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl md:text-[36px] font-extrabold text-[#111827] mt-1 sm:mt-2 md:mt-3">4.9 / 5</p>
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#6B7280] mt-0.5 sm:mt-1.5">Average Rating</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center border border-[#ECEBF2] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <HandshakeIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl md:text-[36px] font-extrabold text-[#111827] mt-1 sm:mt-2 md:mt-3">24 / 7</p>
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#6B7280] mt-0.5 sm:mt-1.5">Support Availability</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center border border-[#ECEBF2] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <BooksIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl md:text-[36px] font-extrabold text-[#111827] mt-1 sm:mt-2 md:mt-3">100+</p>
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#6B7280] mt-0.5 sm:mt-1.5">Academic Subjects</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROOF OF A+ GRADES CAROUSEL ===================== */}
      <section className="py-7 sm:py-16 md:py-24">
        <div className="container mx-auto max-w-[1240px] px-3 sm:px-4">
          <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[#9CA3AF] tracking-[0.08em] uppercase text-center mb-1.5 sm:mb-2.5">
            LEARN MORE ABOUT US WHILE YOU WAIT…
          </p>
          <h2 className="text-xl sm:text-3xl md:text-[40px] font-bold text-[#111827] text-center mb-5 sm:mb-10 md:mb-12 tracking-[-0.01em]">
            Proof of A+ Grades, Achieved By Us for Students Like You
          </h2>

          <div className="relative px-6 sm:px-12 md:px-14">
            <Slider {...proofSliderSettings}>
              {content.proofs.map((item, index) => (
                <div key={index} className="outline-none">
                  <div className="flex justify-center items-center py-1 sm:py-2">
                    <div className="relative w-full max-w-[1140px] rounded-xl sm:rounded-2xl md:rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#E5E7EB] bg-white">
                      <Image
                        src={item}
                        alt={`Proof of A+ Grade ${index + 1}`}
                        className="w-full h-auto object-contain"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="flex justify-center mt-5 sm:mt-10 md:mt-12">
            <WhatsAppButton onClick={apiCall} />
          </div>
        </div>
      </section>

      {/* ===================== TRUSTPILOT REVIEWS ===================== */}
      <section className="py-7 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-[1240px] px-3 sm:px-4">
          <h2 className="text-xl sm:text-3xl md:text-[40px] font-bold text-[#111827] text-center mb-1 tracking-[-0.01em]">
            How Student Rate Us!
          </h2>
          <p className="text-lg sm:text-2xl md:text-[28px] font-bold text-[#111827] text-center mb-1.5 sm:mb-2">
            Excellent
          </p>
          <div className="flex justify-center items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Image src={Trustpilot} alt="Trustpilot" className="w-5 sm:w-7 md:w-8 h-auto" />
              <span className="text-base sm:text-xl md:text-2xl font-bold text-[#111827]">Trustpilot</span>
            </div>
            <Image src={StarGroup} alt="5 Stars" className="h-4 sm:h-5 md:h-6 w-auto" />
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] text-center mb-5 sm:mb-10 md:mb-12 font-medium">
            Rated 4.9/5 based on 1000+ Reviews
          </p>

          {/* Desktop Reviews Slider (3x4 grid per slide) */}
          <div className="hidden md:block relative px-6 sm:px-12 md:px-14">
            <Slider {...reviewSliderSettings}>
              {desktopReviews.map((item, index) => (
                <div key={index} className="outline-none">
                  <div className="px-2">
                    <div className="w-full max-w-[1140px] mx-auto">
                      <Image
                        src={item}
                        alt={`Student Review Grid ${index + 1}`}
                        className="w-full h-auto"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Mobile Reviews Slider (Single card per slide) */}
          <div className="block md:hidden relative px-4">
            <Slider {...reviewSliderSettings}>
              {mobileReviews.map((item, index) => (
                <div key={index} className="outline-none">
                  <div className="px-1">
                    <Image
                      src={item}
                      alt={`Student Review ${index + 1}`}
                      className="w-full h-auto"
                      priority={index === 0}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="flex justify-center mt-6 sm:mt-10 md:mt-14 mb-4 sm:mb-8">
            <WhatsAppButton onClick={apiCall} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThankYou;
