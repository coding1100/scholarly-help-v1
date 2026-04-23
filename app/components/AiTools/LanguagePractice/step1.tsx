"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguagePractice } from "@/app/context/LanguagePracticeContext";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

const PRESET_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Mandarin Chinese",
  "Arabic",
  "Italian",
  "Portuguese",
  "Hindi",
  "Russian",
  "Turkish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Polish",
  "Czech",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Swahili",
  "Latin",
];

export default function Step1() {
  const { language, setLanguage, setStep } = useLanguagePractice();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom",
  );
  const [maxHeight, setMaxHeight] = useState<string>("256px");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = language ?? "";
  const canContinue = Boolean(selected.trim());

  const filteredLanguages = PRESET_LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate dropdown position based on available viewport space
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const estimatedDropdownHeight = 300; // Approximate height of dropdown

      // If not enough space below but enough space above, position upward
      if (
        spaceBelow < estimatedDropdownHeight &&
        spaceAbove > estimatedDropdownHeight
      ) {
        setDropdownPosition("top");
        setMaxHeight(`${Math.max(200, spaceAbove - 20)}px`);
      } else {
        setDropdownPosition("bottom");
        setMaxHeight(`${Math.max(200, spaceBelow - 20)}px`);
      }
    }
  }, [isOpen]);

  const handleContinue = async () => {
    if (!canContinue || isLoading) return;
    trackToolGenerate({ toolName: "Language Practice" });
    setIsLoading(true);
    // Small delay for smooth UX transition
    await new Promise((resolve) => setTimeout(resolve, 300));
    setStep(2);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Modern header card with gradient */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6 shadow-lg shadow-blue-100/50">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#155dfc] text-white shadow-md">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div className="text-lg font-bold tracking-tight text-gray-900">
              Choose Your Language
            </div>
          </div>
          <div className="text-sm text-gray-600">
          I&apos;ll personalize your learning journey based on your level and
            goals.
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-purple-200/20 blur-2xl" />
      </div>

      {/* Modern dropdown selector */}
      <div className="relative">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Select Language
        </label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={[
              "w-full rounded-2xl border-2 bg-white px-4 py-4 text-left shadow-md transition-all duration-200",
              isOpen
                ? "border-[#155dfc] shadow-lg shadow-blue-100/50"
                : "border-gray-200 hover:border-gray-300 hover:shadow-lg",
              selected ? "text-gray-900" : "text-gray-500",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className={selected ? "font-semibold" : ""}>
                {selected || "Choose a language..."}
              </span>
              <svg
                className={[
                  "h-5 w-5 text-gray-400 transition-transform duration-200",
                  isOpen ? "rotate-180" : "",
                ].join(" ")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              {/* Dropdown menu */}
              <div
                ref={dropdownRef}
                className={[
                  "absolute z-20 w-full rounded-2xl border-2 border-gray-200 bg-white shadow-2xl",
                  dropdownPosition === "top"
                    ? "bottom-full mb-2"
                    : "top-full mt-2",
                ].join(" ")}
                style={{ maxHeight }}
              >
                {/* Search input */}
                <div className="sticky top-0 border-b border-gray-100 bg-white p-3 z-10">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#155dfc] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>
                {/* Options list */}
                <div className="h-[200px] overflow-y-scroll">
                  <div className="p-2">
                    {filteredLanguages.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No languages found
                      </div>
                    ) : (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setLanguage(lang);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className={[
                            "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150",
                            selected === lang
                              ? "bg-blue-50 text-[#1447e6]"
                              : "text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between">
                            <span>{lang}</span>
                            {selected === lang && (
                              <svg
                                className="h-5 w-5 text-[#155dfc]"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Selected language display */}
        {selected && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#155dfc] text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium text-[#155dfc]">
                Selected Language
              </div>
              <div className="text-sm font-bold text-gray-900">{selected}</div>
            </div>
          </div>
        )}
      </div>

      {/* Modern tip card */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#155dfc]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Tip:</span> Don&apos;t worry about being
            &quot;ready&quot; — we&apos;ll start easy and level up fast! 🚀
          </div>
        </div>
      </div>

      {/* Modern CTA button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={!canContinue || isLoading}
          onClick={handleContinue}
          className={[
            "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300",
            canContinue && !isLoading
              ? "bg-gradient-to-r from-[#155dfc] to-[#1447e6] hover:from-[#1447e6] hover:to-[#193cb8] hover:shadow-xl hover:shadow-[#155dfc]/30 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Continue to assessment</span>
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
            </>
          )}
        </button>
      </div>
    </div>
  );
}
