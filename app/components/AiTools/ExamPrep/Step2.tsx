"use client";

import { HiCalendar, HiArrowLeft } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";

interface Step2Props {
  examDate: string;
  apiResponse: {
    conversation_id: string;
    message: string;
    agent_id: string;
  };
  examType: string;
  subject: string;
  knowledgeLevel: string;
  onBack?: () => void;
  onStartPractice?: (conversationId: string) => Promise<void>;
  isLoading?: boolean;
}

interface Phase {
  title: string;
  description: string;
  months: Array<{
    month: string;
    weeks: Array<{
      week: string;
      content: string;
    }>;
  }>;
}

interface ParsedSchedule {
  examDate: string;
  goal: string;
  pace: string;
  level: string;
  phases: Phase[];
  tips: string[];
  rawMessage: string;
}

function parseScheduleMarkdown(
  markdown: string,
  examDate: string,
): ParsedSchedule {
  const schedule: ParsedSchedule = {
    examDate: examDate,
    goal: "",
    pace: "",
    level: "",
    phases: [],
    tips: [],
    rawMessage: markdown,
  };

  // Extract Goal, Pace, Level from the header
  const goalMatch = markdown.match(/\*\*Goal:\*\* (.+?)(?:\n|$)/);
  const paceMatch = markdown.match(/\*\*Pace:\*\* (.+?)(?:\n|$)/);
  const levelMatch = markdown.match(/\*\*Level:\*\* (.+?)(?:\n|$)/);

  if (goalMatch) schedule.goal = goalMatch[1].trim();
  if (paceMatch) schedule.pace = paceMatch[1].trim();
  if (levelMatch) schedule.level = levelMatch[1].trim();

  // The user-provided exam date is the source of truth (set above). We do NOT
  // override it from the agent's prose — a previous hardcoded match forced every
  // schedule to 2026-02-01 regardless of what the user picked.

  // Clean up the message - remove intro and ending questions
  let cleanedMessage = markdown;

  // Remove initial greeting
  cleanedMessage = cleanedMessage.replace(/^Of course!.*?\.\s*/i, "");
  cleanedMessage = cleanedMessage.replace(
    /^Creating a study plan.*?\.\s*/i,
    "",
  );

  // Remove ending question
  cleanedMessage = cleanedMessage.replace(/\n\nWhat do you think\?.*$/i, "");
  cleanedMessage = cleanedMessage.replace(/\n\nWe could start.*$/i, "");

  schedule.rawMessage = cleanedMessage.trim();

  return schedule;
}

export default function Step2({
  examDate,
  apiResponse,
  examType,
  subject,
  knowledgeLevel,
  onBack,
  onStartPractice,
  isLoading = false,
}: Step2Props) {
  const schedule = parseScheduleMarkdown(apiResponse.message, examDate);

  return (
    <div className="h-[calc(100vh-8vh)] overflow-y-auto flex justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-4xl my-8">
        {/* Glassmorphism Card */}
        <div className="border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-semibold text-black">
                Your Study Schedule
              </p>
              <HiCalendar className="text-2xl text-[#51a2ff]" />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Your personalized study plan leading up to your exam.
            </p>
            <p className="text-2xl font-bold text-[#51a2ff] mt-4 border-b-2 border-teal-400 pb-2 inline-block">
              Study Schedule: Exam on {schedule.examDate}
            </p>
          </div>

          {/* Schedule Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-teal-400 rounded"></div>
              <p className="text-xl md:text-2xl font-bold text-black">
                Schedule Overview
              </p>
            </div>
            <ul className="text-black space-y-2 ml-4">
              <li>• Exam Date: {schedule.examDate}</li>
              {schedule.goal && <li>• Goal: {schedule.goal}</li>}
              {schedule.pace && <li>• Pace: {schedule.pace}</li>}
              {schedule.level && <li>• Level: {schedule.level}</li>}
            </ul>
          </div>

          {/* Study Plan Content - Using ReactMarkdown for proper formatting */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-teal-400 rounded"></div>
              <h3 className="text-xl md:text-2xl font-bold text-black">
                Study Plan
              </h3>
            </div>
            <div className="ml-4 text-black">
              <ReactMarkdown
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-bold text-black mb-4 mt-6 first:mt-0 flex items-center gap-2">
                      <div className="w-1 h-6 bg-teal-400 rounded"></div>
                      <span>{children}</span>
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-bold text-[#51a2ff] mb-3 mt-4">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-500 mb-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-black">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-500">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc mb-4 space-y-2 text-gray-500 ml-6">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal mb-4 space-y-2 text-gray-500 ml-6">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1 text-gray-500 leading-relaxed">
                      {children}
                    </li>
                  ),
                  hr: () => <hr className="my-6 border-gray-600" />,
                }}
              >
                {schedule.rawMessage}
              </ReactMarkdown>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="sm:flex gap-4 mt-8">
            <button
              onClick={onBack}
              className="sm:flex-1 w-full px-6 py-2 rounded-lg border-2 border-gray-300 text-black font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <HiArrowLeft className="text-xl" />
              Back
            </button>
            <button
              onClick={() => onStartPractice?.(apiResponse.conversation_id)}
              disabled={isLoading}
              className="sm:flex-1 w-full sm:mt-0 mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#155dfc] to-[#1447e6] text-white font-semibold hover:from-[#1447e6] hover:to-[#193cb8] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Generating Exam...
                </>
              ) : (
                <>
                  Start Practice Exam
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
