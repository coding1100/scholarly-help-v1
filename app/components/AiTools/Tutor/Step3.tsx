"use client";

import { useState } from "react";

interface Step3Props {
  subject: string;
  onContinue?: (subject: string, skillLevel: string) => void;
  isLoading?: boolean;
}

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const skillLevels: {
  level: SkillLevel;
  icon: string;
  description: string;
}[] = [
    {
      level: "Beginner",
      icon: "🌱",
      description: "Just starting with basic concepts",
    },
    {
      level: "Intermediate",
      icon: "📚",
      description: "Comfortable with core concepts",
    },
    {
      level: "Advanced",
      icon: "⭐",
      description: "Ready for complex topics",
    },
  ];

export default function Step3({
  subject,
  onContinue,
  isLoading = false,
}: Step3Props) {
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);

  const handleContinue = () => {
    if (selectedLevel) {
      onContinue?.(subject, selectedLevel);
    }
  };

  return (

    <div className="h-[calc(100vh-9vh)] overflow-y-auto">
      <div className="flex items-center justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-2xl relative">
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Title */}
              <p className="text-xl font-semibold text-black text-center mb-3 leading-tight">
                {subject} Skill Assessment 📊
              </p>

              {/* Subtitle */}
              <p className="text-gray-600 text-center mb-8 text-sm">
                How would you rate your child&apos;s current {subject.toLowerCase()}{" "}
                proficiency?
              </p>

              {/* Skill Level Options */}
              <div className="space-y-4 mb-4">
                {skillLevels.map((skill) => (
                  <button
                    key={skill.level}
                    onClick={() => setSelectedLevel(skill.level)}
                    className={`w-full p-6 rounded-xl bg-white/40 backdrop-blur-md border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${selectedLevel === skill.level
                      ? "border-[#2b7fff] shadow-lg shadow-[#2b7fff]/30"
                      : "border-gray-300/50 hover:border-gray-400/50"
                      }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="text-3xl mb-3">{skill.icon}</div>

                      {/* Skill Level Name */}
                      <p className="text-xl font-semibold text-black mb-2">
                        {skill.level}
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 text-sm">
                        {skill.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedLevel || isLoading}
                className="w-full py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
