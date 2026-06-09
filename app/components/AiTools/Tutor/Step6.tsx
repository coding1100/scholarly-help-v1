"use client";

import { ParsedQuestion } from "@/app/utilities/api";
import { useState, useEffect } from "react";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface Step6Props {
  childName: string;
  topic: string;
  difficulty: string;
  questions: ParsedQuestion[];
  onContinue?: () => void;
}

export default function Step6({
  childName,
  topic,
  difficulty,
  questions,
  onContinue,
}: Step6Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Brief loading screen simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleStartQuiz = () => {
    if (questions && questions.length > 0) {
      onContinue?.();
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        <ToolsApiLoader show contained respectToolsSidebar={false} />
      </div>
    );
  }


  return (
    <div className=" min-h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-2xl relative">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Title */}
            <p className="text-xl font-semibold text-black text-center mb-3 leading-tight">
              Ready to Learn {topic}? 🎯
            </p>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-8 text-sm">
              Hi {childName}! Let's practice {topic.toLowerCase()} at{" "}
              {difficulty} level. Answer the questions below and I'll help you
              learn!
            </p>

            {/* Start Quiz Button */}
            <button
              onClick={handleStartQuiz}
              className="w-full py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
