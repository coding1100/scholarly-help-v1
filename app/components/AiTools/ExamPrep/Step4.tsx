"use client";

import {
  HiAcademicCap,
  HiChartBar,
  HiArrowLeft,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi";

interface Step4Props {
  examType: string;
  subject: string;
  examResults: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    answers: Map<number, string>;
  };
  onBackToSchedule?: () => void;
  onTakePracticeExam?: () => void;
}

export default function Step4({
  examType,
  subject,
  examResults,
  onBackToSchedule,
  onTakePracticeExam,
}: Step4Props) {
  // Calculate metrics (for now using current exam result)
  // In a real app, these would come from stored historical data
  const examReadiness = examResults.score; // Use current score as readiness
  const averageScore = examResults.score; // For now, same as current score
  const bestScore = examResults.score; // For now, same as current score
  const examsTaken = 1; // This would be from database in real app

  // Format date for recent exams
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-4xl my-8">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <p className="text-2xl font-semibold text-black">
                Progress Dashboard
              </p>
              <HiAcademicCap className="text-3xl text-[#51a2ff]" />
              <HiChartBar className="text-3xl text-[#51a2ff]" />
            </div>
            <p className="text-gray-500 text-base mt-1">
              Track your exam preparation progress and performance.
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Exam Readiness Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                {/* <HiTarget className="text-3xl text-[#51a2ff]" /> */}
              </div>
              <div className="text-4xl font-bold text-[#51a2ff] mb-2">
                {examReadiness}%
              </div>
              <div className="text-gray-500 text-sm mb-3">Exam Readiness</div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#2b7fff] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${examReadiness}%` }}
                ></div>
              </div>
            </div>

            {/* Average Score Card */}
            {/* <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <HiChartBar className="text-3xl text-[#51a2ff]" />
                            </div>
                            <div className="text-4xl font-bold text-[#51a2ff] mb-2">
                                {averageScore.toFixed(1)}%
                            </div>
                            <div className="text-gray-500 text-sm">
                                Average Score
                            </div>
                        </div> */}

            {/* Best Score Card */}
            {/* <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <HiTrophy className="text-3xl text-[#51a2ff]" />
                            </div>
                            <div className="text-4xl font-bold text-[#51a2ff] mb-2">
                                {bestScore}%
                            </div>
                            <div className="text-gray-500 text-sm">
                                Best Score
                            </div>
                        </div> */}
          </div>

          {/* Exams Taken Card */}
          {/* <div className="mb-6">
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-xs">
                            <div className="flex items-center justify-between mb-4">
                                <HiDocumentText className="text-3xl text-[#51a2ff]" />
                            </div>
                            <div className="text-4xl font-bold text-black mb-2">
                                {examsTaken}
                            </div>
                            <div className="text-gray-500 text-sm">
                                Exams Taken
                            </div>
                        </div>
                    </div> */}

          {/* Recent Practice Exams Section */}
          <div className="mb-8">
            <p className="text-xl font-bold text-black mb-4">
              Recent Practice Exams
            </p>
            <div className="space-y-3">
              <div className="backdrop-blur-xl bg-gray-100 border border-gray-500 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-black font-semibold text-lg">
                    {subject}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {formattedDate}
                  </div>
                </div>
                <div
                  className={`text-xl font-bold ${
                    examResults.score < 50
                      ? "text-red-400"
                      : examResults.score < 70
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {examResults.score}%
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sm:flex gap-4 mb-6">
            <button
              // onClick={() => {
              //     console.log("View Weak Areas");
              // }}
              onClick={onBackToSchedule}
              className="sm:flex-1 w-full px-6 py-4 rounded-xl text-black font-semibold border border-[#6C757D] hover:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <HiArrowLeft className="text-xl" />
              Back to Schedule
            </button>
            <button
              onClick={onTakePracticeExam}
              className="sm:flex-1 w-full sm:mt-0 mt-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#155dfc] to-[#1447e6] text-white font-bold hover:from-[#1447e6] hover:to-[#193cb8] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {/* <HiRocket className="text-xl" /> */}
              Take Practice Exam
            </button>
          </div>

          {/* Back to Schedule Button */}
          {/* <div className="flex justify-center">
                        <button
                            onClick={onBackToSchedule}
                            className="text-gray-500 hover:text-black transition-colors flex items-center gap-2"
                        >
                            <HiArrowLeft className="text-xl" />
                            Back to Schedule
                        </button>
                    </div> */}
        </div>
      </div>
    </div>
  );
}
