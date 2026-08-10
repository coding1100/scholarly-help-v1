"use client";
import React, { useEffect, useState } from "react";
import { LuZap } from "react-icons/lu";
import PricingPopup from "./PricingPopup";
import { usePathname } from "next/navigation";
import { isGuest } from "@/app/lib/client/guestStudyLimits";

const ToolHeader: React.FC = () => {
  const [showPricing, setShowPricing] = useState(false);
  // Guests have no usage/account, so the pricing CTA is hidden for them.
  // Defaults to false during SSR for stable markup until storage is read.
  const [guest, setGuest] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    setGuest(isGuest());
  }, []);

  // Normalize path by removing trailing slash for consistent comparison
  const normalizedPath = currentPath?.endsWith("/")
    ? currentPath.slice(0, -1)
    : currentPath;

  return (
    <header className="relative flex h-[8vh] flex-shrink-0 items-center justify-between px-4 bg-white border-b ">
      <div></div>
      {/* Centered Title */}

      <h1 className="md:text-xl font-semibold text-gray-800 transition-colors duration-300">
        {normalizedPath === "/tools/paraphraser-tool"
          ? "AI Paraphraser"
          : normalizedPath === "/tools/summarizer-tool"
            ? "AI summarizer"
            : normalizedPath === "/tools/thesis-generator-tool"
              ? "AI Thesis Statement Generator"
              : normalizedPath === "/tools/essay-outline-tool"
                ? "AI Essay Outline"
                : normalizedPath === "/tools/essay-title"
                  ? "AI Essay Title Generator"
                  : normalizedPath === "/tools/research-question"
                    ? "AI Research Question Generator"
                    : normalizedPath === "/tools/math-solver"
                      ? "Math Solver"
                      : normalizedPath === "/tools/citation-tool"
                        ? "AI Citation "
                        : normalizedPath === "/tools/tutor"
                          ? "AI Tutor"
                          : normalizedPath === "/tools/exam-prep"
                            ? "AI Exam Prep"
                            : normalizedPath === "/tools/mirco-learning"
                              ? "AI Micro Learning"
                              : normalizedPath === "/tools/language-practice"
                                ? "AI Language Practice"
                                : normalizedPath === "/tools/study-workspace"
                                  ? "AI Study Workspace"
                                : normalizedPath === "/tools/cgpa-calculator"
                                  ? "CGPA Calculator"
                                  : normalizedPath === "/tools/plagiarism-checker"
                                    ? "Plagiarism Checker"
                                  : ""}
      </h1>

      {/* Right-aligned Button — hidden for guests (no usage/account yet) */}
      {/* <div className="absolute right-6"> */}
      {!guest ? (
        <button
          type="button"
          onClick={() => setShowPricing(true)}
          className="flex font-sans items-center justify-center gap-2 rounded-lg bg-[#4f39f6] pl-3 pr-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#615fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f39f6] transition-colors duration-300"
        >
          <LuZap className="h-4 w-4 text-white" />
          See Pricing
        </button>
      ) : (
        <div />
      )}
      {/* </div> */}
      {showPricing && <PricingPopup onClose={() => setShowPricing(false)} />}
    </header>
  );
};

export default ToolHeader;
