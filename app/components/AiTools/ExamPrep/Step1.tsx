"use client";

import { useState, useRef, useEffect } from "react";
import { HiDocumentText, HiCalendar } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
import { sendChatMessage, ChatResponse } from "@/app/utilities/api";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import { requestTokenUsageRefresh } from "@/app/utils/tokenUsageClient";

interface Step1Props {
  onContinue?: (data: {
    examType: string;
    subject: string;
    examDate: string;
    knowledgeLevel: string;
    targetScore: string;
    hoursPerDay: number;
    apiResponse: ChatResponse;
  }) => void;
}

const examTypes = [
  "Select exam type...",
  "SAT",
  "ACT",
  "GRE",
  "GMAT",
  "TOEFL",
  "IELTS",
  "Certification Exam",
  "Academic Exam",
  "Other",
];

const knowledgeLevels = [
  "Select your level...",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function Step1({ onContinue }: Step1Props) {
  const [examType, setExamType] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [isExamTypeOpen, setIsExamTypeOpen] = useState(false);
  const [isKnowledgeLevelOpen, setIsKnowledgeLevelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examTypeRef = useRef<HTMLDivElement>(null);
  const knowledgeLevelRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        examTypeRef.current &&
        !examTypeRef.current.contains(event.target as Node)
      ) {
        setIsExamTypeOpen(false);
      }
      if (
        knowledgeLevelRef.current &&
        !knowledgeLevelRef.current.contains(event.target as Node)
      ) {
        setIsKnowledgeLevelOpen(false);
      }
    };

    if (isExamTypeOpen || isKnowledgeLevelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExamTypeOpen, isKnowledgeLevelOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!examType || !subject || !examDate || !knowledgeLevel) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate exam date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (examDate < today) {
      setError(
        "Exam date cannot be in the past. Please select today or a future date.",
      );
      return;
    }

    setIsLoading(true);

    try {
      trackToolGenerate({ toolName: "Exam Prep" });
      // Format the message payload
      const currentLevel = knowledgeLevel.toLowerCase();
      const message = `Use the create_study_schedule tool with:\n- exam_date: "${examDate}"\n- subjects: "${subject}"\n- hours_per_day: ${hoursPerDay}\n- current_level: "${currentLevel}"`;

      // Call the API
      const response = await sendChatMessage(message, null);
      requestTokenUsageRefresh(0);

      // Pass data to next step
      if (onContinue) {
        onContinue({
          examType,
          subject,
          examDate,
          knowledgeLevel,
          targetScore,
          hoursPerDay,
          apiResponse: response,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create study schedule. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8vh)] overflow-y-auto flex justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-2xl font-semibold text-black">
                Exam Information
              </p>
              <HiDocumentText className="text-2xl text-[#51a2ff]" />
            </div>
            <p className="text-black text-sm mt-2">
              Tell us about the exam you&apos;re preparing for
              <br />
              so we can create a personalized study plan.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exam Type */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Exam Type:
              </label>
              <div className="relative" ref={examTypeRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExamTypeOpen(!isExamTypeOpen);
                    setIsKnowledgeLevelOpen(false);
                  }}
                  className="w-full text-sm px-4 py-3 rounded-lg bg-gray-100 backdrop-blur-md border border-gray-300/50 text-black text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 transition-all"
                >
                  <span className={examType ? "text-black " : "text-gray-400"}>
                    {examType || "Select exam type..."}
                  </span>
                  <HiChevronDown
                    className={`text-black text-lg transition-transform ${isExamTypeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isExamTypeOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-[#155dfc] rounded-lg shadow-xl border border-[#2b7fff]/50 max-h-60 overflow-y-auto">
                    {examTypes.map((type, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index === 0) return;
                          setExamType(type);
                          setIsExamTypeOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-white hover:bg-[#2b7fff] transition-colors ${
                          examType === type ? "bg-[#2b7fff]" : ""
                        } ${index === 0 ? "text-gray-300 cursor-not-allowed" : ""}`}
                        disabled={index === 0}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Subject:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value.replace(/\s/g, ""))}
                placeholder="e.g., Mathematics, Biology, Python Programming"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
              />
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Exam Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={examDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="text-sm w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 transition-all [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                />
                <HiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none z-10" />
              </div>
            </div>

            {/* Current Knowledge Level */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Current Knowledge Level:
              </label>
              <div className="relative" ref={knowledgeLevelRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKnowledgeLevelOpen(!isKnowledgeLevelOpen);
                    setIsExamTypeOpen(false);
                  }}
                  className="w-full text-sm px-4 py-3 rounded-lg bg-gray-100 backdrop-blur-md border border-gray-300/50 text-black text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 transition-all"
                >
                  <span
                    className={knowledgeLevel ? "text-black" : "text-gray-400"}
                  >
                    {knowledgeLevel || "Select your level..."}
                  </span>
                  <HiChevronDown
                    className={`text-black text-lg transition-transform ${isKnowledgeLevelOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isKnowledgeLevelOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-[#155dfc] rounded-lg shadow-xl border border-[#2b7fff]/50 max-h-60 overflow-y-auto">
                    {knowledgeLevels.map((level, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index === 0) return;
                          setKnowledgeLevel(level);
                          setIsKnowledgeLevelOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-white hover:bg-[#2b7fff] transition-colors ${
                          knowledgeLevel === level ? "bg-[#2b7fff]" : ""
                        } ${index === 0 ? "text-gray-300 cursor-not-allowed" : ""}`}
                        disabled={index === 0}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Target Score (Optional) */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Target Score (Optional):
              </label>
              <input
                type="text"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="e.g., 1500 for SAT"
                className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm italic"
              />
            </div>

            {/* Hours Available Per Day */}
            <div>
              <label className="block text-black font-semibold mb-1 text-sm">
                Hours Available Per Day:
              </label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[#ffa2a2] border border-[#fb2c36] text-white text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer gap-2 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Schedule...
                </>
              ) : (
                <>
                  Create Study Schedule
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
