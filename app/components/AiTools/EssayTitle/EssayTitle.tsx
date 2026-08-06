"use client";

import React, { FC, useEffect, useState } from "react";
import { FaChevronDown, FaRegCopy, FaSyncAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { getAccessToken } from "@/app/lib/authSession";
import { rankAcademicText, useLatestAbortController } from "@/app/lib/client/toolOptimization";

interface EssayTitleProps {
  setFlag: (value: boolean) => void;
  /**
   * "landing" renders the same tool as a rounded, shadowed hero card (used on
   * the /tools/ai-essay-title-generator landing page); the default keeps the
   * /tools styling.
   */
  variant?: "default" | "landing";
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TitleResponseData {
  topic: string | null;
  keywords: string | null;
  tone?: string;
  style_engagement?: string;
  academic_level?: string;
  requested_count: number;
  titles: string[];
  raw_output: string;
  llm_used: string;
  tokens_used: number;
}

type TitleResponse = ApiEnvelope<TitleResponseData>;

// Tone options with display labels
const toneOptions = [
  { value: "formal", label: "Formal" },
  { value: "research-based", label: "Research-Based" },
  { value: "analytical", label: "Analytical" },
  { value: "argumentative", label: "Argumentative" },
  { value: "critical", label: "Critical" },
  { value: "theoretical", label: "Theoretical" },
  { value: "empirical", label: "Empirical" },
  { value: "case-study-oriented", label: "Case Study-Oriented" },
  { value: "custom", label: "Custom" },
];

// Style & Engagement options with display labels
const styleEngagementOptions = [
  { value: "creative", label: "Creative" },
  { value: "persuasive", label: "Persuasive" },
  { value: "problem-solution", label: "Problem-Solution" },
];

// Academic Level options with display labels
const academicLevelOptions = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "doctoral", label: "Doctoral" },
  { value: "journal-ready", label: "Journal-Ready" },
];

const EssayTitle: FC<EssayTitleProps> = ({ setFlag, variant = "default" }) => {
  const isLanding = variant === "landing";
  const [token, setToken] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [customToneInstructions, setCustomToneInstructions] = useState("");
  const [styleEngagement, setStyleEngagement] = useState<string>("");
  const [academicLevel, setAcademicLevel] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const nextController = useLatestAbortController();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
    }
  }, []);

  const handleClear = () => {
    setTopic("");
    setKeywords("");
    setTone("");
    setCustomToneInstructions("");
    setStyleEngagement("");
    setAcademicLevel("");
    setCount(5);
    setTitles([]);
    setError("");
  };

  const handleGenerate = async () => {
    // Validation: Topic is required
    if (!topic.trim()) {
      setError("Please provide a topic.");
      toast.error("Please provide a topic.");
      return;
    }
    if (tone === "custom" && !customToneInstructions.trim()) {
      setError("Please add custom tone instructions.");
      toast.error("Please add custom tone instructions.");
      return;
    }

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Essay Title Generator" });
      setIsSubmitting(true);
      setError("");
      setTitles([]);

      try {
        const controller = nextController();
        const payload: {
          topic?: string;
          keywords?: string;
          tone?: string;
          style_engagement?: string;
          academic_level?: string;
          custom_tone_instructions?: string;
          count?: number;
        } = {};

        if (topic.trim()) {
          payload.topic = topic.trim();
        }
        if (keywords.trim()) {
          payload.keywords = keywords.trim();
        }
        if (tone) {
          payload.tone = tone;
        }
        if (tone === "custom") {
          payload.custom_tone_instructions = customToneInstructions.trim();
        }
        if (styleEngagement) {
          payload.style_engagement = styleEngagement;
        }
        if (academicLevel) {
          payload.academic_level = academicLevel;
        }
        if (count) {
          payload.count = count;
        }

        const baseUrl =
          process.env.NEXT_PUBLIC_NGROX_URL ||
          process.env.NEXT_PUBLIC_BASE_URL ||
          "";
        const endpoint = `${baseUrl}/tools/essay-title-generator`;

        const response = await axios.post<TitleResponse>(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const titles = response.data?.data?.titles;
        if (response.data?.success && Array.isArray(titles) && titles.length > 0) {
          setTitles(rankAcademicText(titles, "title").map((item) => item.text));
          setFlag(true);
          toast.success(response.data?.message || "Titles generated successfully!");
        } else {
          setError("Failed to generate titles. Please try again.");
          toast.error("Failed to generate titles.");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast.success("Title copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy title.");
    }
  };

  const handleRegenerate = () => {
    if (topic.trim()) {
      handleGenerate();
    }
  };

  return (
    <div
      className={
        isLanding
          ? "relative w-full"
          : "container relative mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl"
      }
    >
      <ToolsApiLoader show={isSubmitting} />
      <div
        className={`bg-white dark:bg-gray-800 overflow-hidden transition-colors duration-300 ${
          isLanding
            ? "rounded-2xl shadow-[0_30px_70px_-20px_rgba(43,28,80,0.35)] text-left"
            : "border dark:border-gray-700"
        }`}
      >
        {/* Main Overview Section */}
        <div className="pt-6 ">
          <h2 className="text-2xl text-center font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
            Essay Title Generator
          </h2>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="space-y-4">
            {/* Topic Input */}
            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
              >
                Topic
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your essay topic here..."
                className="w-full h-24 p-3 rounded-md focus:outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
              />
            </div>

            {/* Keywords Input */}
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
              >
                Keywords (Optional)
              </label>
              <textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords separated by commas (e.g., renewable energy, sustainability, solar power)..."
                className="w-full h-24 p-3 rounded-md focus:outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
              />
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors duration-300">
              Note: Topic is required. Keywords are optional.
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Options Row - Form order: Tone → Style & Engagement → Academic Level → Number of Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tone Selector */}
              <div>
                <label
                  htmlFor="tone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Tone:
                </label>
                <div className="relative">
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select tone...</option>
                    {toneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {tone === "custom" && (
                <div className="md:col-span-2">
                  <label
                    htmlFor="customTitleTone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    Custom Tone Instructions:
                  </label>
                  <textarea
                    id="customTitleTone"
                    value={customToneInstructions}
                    onChange={(e) => setCustomToneInstructions(e.target.value)}
                    placeholder="Write 3-4 lines describing the title tone you want..."
                    className="w-full h-24 p-3 rounded-md focus:outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
              )}

              {/* Style & Engagement Selector */}
              <div>
                <label
                  htmlFor="styleEngagement"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Style & Engagement:
                </label>
                <div className="relative">
                  <select
                    id="styleEngagement"
                    value={styleEngagement}
                    onChange={(e) => setStyleEngagement(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select style...</option>
                    {styleEngagementOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Academic Level Selector */}
              <div>
                <label
                  htmlFor="academicLevel"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Academic Level:
                </label>
                <div className="relative">
                  <select
                    id="academicLevel"
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select level...</option>
                    {academicLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Count Selector */}
              <div>
                <label
                  htmlFor="count"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Number of Titles (1-10):
                </label>
                <div className="relative">
                  <select
                    id="count"
                    value={count}
                    onChange={(e) => setCount(Number.parseInt(e.target.value))}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={
                  isSubmitting ||
                  !topic.trim() ||
                  (tone === "custom" && !customToneInstructions.trim())
                }
                className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
                  isSubmitting ||
                  !topic.trim() ||
                  (tone === "custom" && !customToneInstructions.trim())
                    ? "bg-[#565add] dark:bg-[#565add] cursor-not-allowed"
                    : "bg-[#565add] hover:bg-[#666adf] dark:bg-[#565add] dark:hover:[#565add]"
                }`}
              >
                {isSubmitting ? "Generating..." : "Generate Titles"}
              </button>

              {titles.length > 0 && (
                <button
                  onClick={handleRegenerate}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSyncAlt />
                  Regenerate
                </button>
              )}

              <button
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {titles.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                Generated Titles ({titles.length})
              </h2>
            </div>
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <p className="flex-1 text-gray-800 dark:text-gray-100 pr-4 transition-colors duration-300">
                    {index + 1}. {title}
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Quality {rankAcademicText([title], "title")[0]?.score ?? 0}</span>
                  </p>
                  <button
                    onClick={() => handleCopyTitle(title)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy title"
                  >
                    <FaRegCopy />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Quote */}
      {!isLanding && (
        <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <q>
            Struggling to find the perfect essay title? ScholarlyHelp&apos;s
            AI-powered Essay Title Generator creates compelling,
            academic-appropriate titles that capture your topic&apos;s essence
            and engage your readers from the start.
          </q>
        </div>
      )}

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default EssayTitle;
