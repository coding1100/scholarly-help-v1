"use client";

import { ParsedQuestion } from "@/app/utilities/api";

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
  const hasQuestions = questions && questions.length > 0;

  const handleStartQuiz = () => {
    if (hasQuestions) {
      onContinue?.();
    }
  };

  return (
    <div className="min-h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-2xl relative">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Title */}
            <h2 className="text-xl font-semibold text-black text-center mb-3 leading-tight">
              Ready to Learn {topic}? 🎯
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-8 text-sm">
              Hi {childName}! Let&apos;s practice {topic.toLowerCase()} at{" "}
              {difficulty} level. Answer the questions below and I&apos;ll help you
              learn!
            </p>

            {/* Start Quiz Button */}
            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={!hasQuestions}
              className="w-full py-3.5 rounded-xl bg-[#5f70ff] hover:bg-[#4a5be6] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              {hasQuestions ? "Start Quiz" : "No Questions Available"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
