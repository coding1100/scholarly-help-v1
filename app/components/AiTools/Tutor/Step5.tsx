"use client";

import { useState } from "react";

interface Step5Props {
  topic: string;
  onContinue?: (level: number, difficulty: string, descriptor: string) => void;
  isLoading?: boolean;
}

interface Level {
  level: number;
  difficulty: string;
  descriptor: string;
  borderColor: string;
  shadowColor: string;
}

const levels: Level[] = [
  {
    level: 1,
    difficulty: "Beginner",
    descriptor: "Easy",
    borderColor: "border-[#00c951]",
    shadowColor: "shadow-[#00c951]/30",
  },
  {
    level: 2,
    difficulty: "Intermediate",
    descriptor: "Medium",
    borderColor: "border-[#fe9a00]",
    shadowColor: "shadow-[#fe9a00]/30",
  },
  {
    level: 3,
    difficulty: "Advanced",
    descriptor: "Hard",
    borderColor: "border-[#ff2056]",
    shadowColor: "shadow-[#ff2056]/30",
  },
];

export default function Step5({
  topic,
  onContinue,
  isLoading = false,
}: Step5Props) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleLevelSelect = (level: Level) => {
    if (isLoading) return;
    setSelectedLevel(level.level);
  };

  const handleContinue = () => {
    const selected = levels.find((level) => level.level === selectedLevel);
    if (!selected || isLoading) return;
    onContinue?.(selected.level, selected.difficulty, selected.descriptor);
  };

  return (
    <div className="min-h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-3xl relative">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Title */}
            <h2 className="text-xl font-semibold text-black text-center mb-3 leading-tight">
              Choose a Level 🎮
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-8 text-sm">
              Select a difficulty level to start learning {topic}
            </p>

            {/* Level Cards */}
            <div className="space-y-6">
              {/* Top Row - 2 Cards */}
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                {levels.slice(0, 2).map((level) => (
                  <button
                    key={level.level}
                    type="button"
                    onClick={() => handleLevelSelect(level)}
                    disabled={isLoading}
                    aria-pressed={selectedLevel === level.level}
                    className={`p-5 rounded-xl bg-white/40 backdrop-blur-md border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      level.borderColor
                    } ${
                      selectedLevel === level.level
                        ? `shadow-lg ${level.shadowColor} ring-2 ring-[#5f70ff]`
                        : "shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <p className="text-xl font-semibold text-black mb-1">
                        Level {level.level}
                      </p>
                      <p className="text-lg font-semibold text-black mb-1">
                        {level.difficulty}
                      </p>
                      <p className="text-base text-gray-600">
                        {level.descriptor}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Row - 1 Centered Card */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleLevelSelect(levels[2])}
                  disabled={isLoading}
                  aria-pressed={selectedLevel === levels[2].level}
                  className={`w-full max-w-md p-5 rounded-xl bg-white/40 backdrop-blur-md border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    levels[2].borderColor
                  } ${
                    selectedLevel === levels[2].level
                      ? `shadow-lg ${levels[2].shadowColor} ring-2 ring-[#5f70ff]`
                      : "shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <p className="text-xl font-semibold text-black mb-1">
                      Level {levels[2].level}
                    </p>
                    <p className="text-lg font-semibold text-black mb-1">
                      {levels[2].difficulty}
                    </p>
                    <p className="text-base text-gray-600">
                      {levels[2].descriptor}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Explicit Continue Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleContinue}
                disabled={selectedLevel === null || isLoading}
                className="w-full max-w-md py-3.5 rounded-xl bg-gradient-to-r from-[#5f70ff] to-[#4a5be6] text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Continue ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
