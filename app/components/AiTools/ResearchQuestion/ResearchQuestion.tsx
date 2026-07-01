"use client";

import React, { FC, useEffect, useState } from "react";
import { FaChevronDown, FaRegCopy, FaSyncAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

interface ResearchQuestionProps {
  setFlag: (value: boolean) => void;
}

interface QuestionResponse {
  status: string;
  topic: string | null;
  keywords: string | null;
  research_type?: string;
  question_style?: string;
  level_of_specificity?: string;
  requested_count: number;
  questions: string[];
  raw_output: string;
  llm_used: string;
  tokens_used: number;
}

// Research Type options with display labels
const researchTypeOptions = [
  { value: "qualitative", label: "Qualitative" },
  { value: "quantitative", label: "Quantitative" },
  { value: "mixed", label: "Mixed" },
  { value: "exploratory", label: "Exploratory" },
  { value: "descriptive", label: "Descriptive" },
  { value: "explanatory-causal", label: "Explanatory / Causal" },
  { value: "correlational", label: "Correlational" },
  { value: "comparative", label: "Comparative" },
  { value: "experimental", label: "Experimental" },
  { value: "quasi-experimental", label: "Quasi-Experimental" },
  { value: "case-study", label: "Case Study" },
  { value: "survey-based", label: "Survey-Based" },
  { value: "action-research", label: "Action Research" },
  { value: "policy-analysis", label: "Policy Analysis" },
  { value: "critical-research", label: "Critical Research" },
];

// Question Style options with display labels
const questionStyleOptions = [
  { value: "broad", label: "Broad" },
  { value: "focused", label: "Focused" },
  { value: "hypothesis-driven", label: "Hypothesis-Driven" },
  { value: "policy-oriented", label: "Policy-Oriented" },
];

// Level of Specificity options with display labels
const levelOfSpecificityOptions = [
  { value: "general", label: "General" },
  { value: "moderately-specific", label: "Moderately Specific" },
  { value: "highly-specific", label: "Highly Specific" },
];

const ResearchQuestion: FC<ResearchQuestionProps> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [researchType, setResearchType] = useState<string>("");
  const [questionStyle, setQuestionStyle] = useState<string>("");
  const [levelOfSpecificity, setLevelOfSpecificity] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const handleClear = () => {
    setTopic("");
    setKeywords("");
    setResearchType("");
    setQuestionStyle("");
    setLevelOfSpecificity("");
    setCount(5);
    setQuestions([]);
    setError("");
  };

  const handleGenerate = async () => {
    // Validation: Topic is required
    if (!topic.trim()) {
      setError("Please provide a topic.");
      toast.error("Please provide a topic.");
      return;
    }

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "Research Question Generator" });
      setIsSubmitting(true);
      setError("");
      setQuestions([]);

      try {
      const payload: {
        topic?: string;
        keywords?: string;
        research_type?: string;
        question_style?: string;
        level_of_specificity?: string;
        count?: number;
      } = {};

      if (topic.trim()) {
        payload.topic = topic.trim();
      }
      if (keywords.trim()) {
        payload.keywords = keywords.trim();
      }
      if (researchType) {
        payload.research_type = researchType;
      }
      if (questionStyle) {
        payload.question_style = questionStyle;
      }
      if (levelOfSpecificity) {
        payload.level_of_specificity = levelOfSpecificity;
      }
      if (count) {
        payload.count = count;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_NGROX_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "";
      const endpoint = baseUrl.includes("/v1/")
        ? `${baseUrl}/tools/research-question-generator`
        : `${baseUrl}/tools/research-question-generator`;

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Backend wraps responses as { success, message, data }
      const responsePayload = response.data?.data ?? response.data;

      if (responsePayload?.status === "success" && responsePayload?.questions) {
        setQuestions(responsePayload.questions);
        setFlag(true);
        toast.success("Research questions generated successfully!");
      } else {
        setError("Failed to generate research questions. Please try again.");
        toast.error("Failed to generate research questions.");
      }
    } catch (error: any) {
      console.error("Error generating research questions:", error);
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

  const handleCopyQuestion = async (question: string) => {
    try {
      await navigator.clipboard.writeText(question);
      toast.success("Question copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy question.");
    }
  };

  const handleRegenerate = () => {
    if (topic.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isSubmitting} />
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Main Overview Section */}
        <div className="pt-6 ">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300 text-center">
            Research Question Generator
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
                placeholder="Enter your research topic here..."
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
                placeholder="Enter keywords separated by commas (e.g., climate change, policy, adaptation strategies)..."
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

            {/* Options Row - Form order: Research Type → Question Style → Level of Specificity → Number of Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Research Type Selector */}
              <div>
                <label
                  htmlFor="research_type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Research Type:
                </label>
                <div className="relative">
                  <select
                    id="research_type"
                    value={researchType}
                    onChange={(e) => setResearchType(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select research type...</option>
                    {researchTypeOptions.map((option) => (
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

              {/* Question Style Selector */}
              <div>
                <label
                  htmlFor="question_style"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Question Style:
                </label>
                <div className="relative">
                  <select
                    id="question_style"
                    value={questionStyle}
                    onChange={(e) => setQuestionStyle(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select question style...</option>
                    {questionStyleOptions.map((option) => (
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

              {/* Level of Specificity Selector */}
              <div>
                <label
                  htmlFor="level_of_specificity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Level of Specificity:
                </label>
                <div className="relative">
                  <select
                    id="level_of_specificity"
                    value={levelOfSpecificity}
                    onChange={(e) => setLevelOfSpecificity(e.target.value)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Select level...</option>
                    {levelOfSpecificityOptions.map((option) => (
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
                  Number of Questions (1-10):
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
                disabled={isSubmitting || !topic.trim()}
                className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
                  isSubmitting || !topic.trim()
                    ? "bg-[#565add] dark:bg-[#565add] cursor-not-allowed"
                    : "bg-[#565add] hover:bg-[#6368f3] dark:bg-[#565add] dark:hover:bg-[#565add]"
                }`}
              >
                {isSubmitting ? "Generating..." : "Generate Questions"}
              </button>

              {questions.length > 0 && (
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
        {questions.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                Generated Research Questions ({questions.length})
              </h2>
            </div>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <p className="flex-1 text-gray-800 dark:text-gray-100 pr-4 transition-colors duration-300">
                    {index + 1}. {question}
                  </p>
                  <button
                    onClick={() => handleCopyQuestion(question)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy question"
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
      <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Need well-structured research questions for your academic project?
          ScholarlyHelp&apos;s AI-powered Research Question Generator creates
          methodologically sound questions tailored to qualitative,
          quantitative, or mixed methods research—helping you build a strong
          foundation for your study.
        </q>
      </div>
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default ResearchQuestion;
