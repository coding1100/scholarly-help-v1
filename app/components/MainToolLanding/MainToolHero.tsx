"use client";

import React, { FC } from "react";
import Link from "next/link";
import MainToolHeroBG from "@/app/assets/Images/aitoollanding/MainToolHeroBG.png";
import mainToolAiIcon from "@/app/assets/Icons/mainToolAiIcon.png";
import Image from "next/image";
import { useAcademicResearchData } from "@/app/(pages)/academic-research/AcademicResearchDataProvider";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";
import { useExpertQuoteModal } from "@/app/components/MainToolLanding/ExpertQuoteModal";

const PICK_TOOLS_SECTION_ID = "pick-tools";
const HEADER_SCROLL_OFFSET = 96;

function resolveScrollTargetId(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed || trimmed === "#") return null;

    if (trimmed.startsWith("#")) {
        const id = trimmed.slice(1);
        return id || null;
    }

    const hashIndex = trimmed.indexOf("#");
    if (hashIndex !== -1) {
        const id = trimmed.slice(hashIndex + 1);
        return id || null;
    }

    if (!trimmed.includes("/") && !trimmed.startsWith("http")) {
        return trimmed;
    }

    return null;
}

function scrollToSection(url: string) {
    const id = resolveScrollTargetId(url);
    if (!id) return;

    const performScroll = () => {
        const target = document.getElementById(id);
        if (!target) return false;

        const top =
            target.getBoundingClientRect().top +
            window.scrollY -
            HEADER_SCROLL_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return true;
    };

    if (performScroll()) return;

    requestAnimationFrame(() => {
        if (!performScroll()) {
            requestAnimationFrame(performScroll);
        }
    });
}

const MainToolHero: FC = () => {
    const pageData = useAcademicResearchData();
    const { openExpertQuoteModal } = useExpertQuoteModal();
    const hero = pageData?.heroSection ?? defaultAcademicResearchContent.heroSection;
    const btn1Url =
        hero.btn1Url?.trim() ||
        defaultAcademicResearchContent.heroSection.btn1Url ||
        `#${PICK_TOOLS_SECTION_ID}`;
    const btn1ScrollTargetId = resolveScrollTargetId(btn1Url);
    const btn1IsScrollLink = btn1ScrollTargetId !== null;

    return (
        <section className="main-tool-hero relative w-full overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src={MainToolHeroBG}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                    aria-hidden
                />
            </div>
            <style jsx>{`
        .main-tool-hero {
          padding-top: 99px;
          padding-bottom: 156px;
        }
        @media (max-width: 768px) {
          .main-tool-hero {
            padding-top: 60px;
            padding-bottom: 80px;
          }
        }
        @media (max-width: 480px) {
          .main-tool-hero {
            padding-top: 40px;
            padding-bottom: 60px;
          }
        }
      `}</style>
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
                <div
                    className="bg-white py-3 sm:py-4 px-4 sm:px-9 rounded-full w-full sm:w-fit max-w-full mx-auto flex justify-center items-center gap-2 sm:gap-3"
                    style={{
                        boxShadow: "rgba(17, 12, 46, 0.15) 0px -48px 100px 0px",
                    }}
                >
                    <Image src={mainToolAiIcon} alt="AI Icon" width={23} height={23} />
                    <p className="text-[#000] text-sm sm:text-base text-center">{hero.badgeText}</p>
                </div>
                <div className="w-full max-w-[720px] mx-auto px-2 sm:px-0">
                    <p className="text-[28px] sm:text-[36px] lg:text-[49px] font-bold text-center relative leading-tight sm:leading-snug lg:leading-normal">
                        {hero.headingPrefix}
                        <span className="relative inline-block text-[#F56200]">
                            {hero.highlightWord}
                            <svg
                                className="pointer-events-none absolute bottom-0 left-1/2 h-[12px] w-[108%] -translate-x-1/2 overflow-visible"
                                viewBox="0 0 140 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 13 C 35 4, 105 4, 136 13"
                                    stroke="#F56200"
                                    strokeWidth="10"
                                />
                            </svg>
                        </span>
                        {hero.headingSuffix}
                    </p>
                </div>
                <div className="w-full max-w-[570px] mx-auto px-2 sm:px-0">
                    <p
                        className="text-center text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: hero.description }}
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 px-2 sm:px-0">
                    {btn1IsScrollLink ? (
                        <button
                            type="button"
                            onClick={() => scrollToSection(btn1Url)}
                            className="bg-[#565ADD] text-base sm:text-xl text-white px-6 sm:px-9 py-3 rounded-[4px] text-center"
                        >
                            {hero.btn1}
                        </button>
                    ) : (
                        <Link
                            href={btn1Url}
                            className="bg-[#565ADD] text-base sm:text-xl text-white px-6 sm:px-9 py-3 rounded-[4px] text-center"
                        >
                            {hero.btn1}
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={openExpertQuoteModal}
                        className="bg-white text-base sm:text-xl text-black px-6 sm:px-9 py-3 rounded-[4px] text-center"
                    >
                        {hero.btn2}
                    </button>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-9 gap-y-3 py-4 sm:py-5 px-2">
                    {hero.specs.map((spec, index) => (
                        <div key={`${spec}-${index}`} className="flex items-center gap-3">
                            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#4935C1]">
                                <svg
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M1 4L3.5 6.5L9 1"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            <p className="text-sm sm:text-base font-normal text-black">{spec}</p>
                        </div>
                    ))}
                </div>
                <div className="w-full flex justify-center items-center">
                    <Link
                        href="/sign-in/"
                        className="group relative inline-block text-sm sm:text-base text-primary-400"
                    >
                        Already have an account? Sign-in
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-[-3px] left-1/2 block h-[1px] w-0 -translate-x-1/2 bg-[repeating-linear-gradient(to_right,#565add_0,#565add_6px,transparent_6px,transparent_12px)] transition-[width] duration-300 ease-out group-hover:w-full"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default MainToolHero;
