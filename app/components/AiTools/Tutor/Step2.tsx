"use client";

import { useState } from "react";

interface Step2Props {
  onContinue?: (subject: string) => void;
  isLoading?: boolean;
}

export default function Step2({ onContinue, isLoading = false }: Step2Props) {
  const [subject, setSubject] = useState("");

  const handleContinue = () => {
    if (subject.trim()) {
      onContinue?.(subject.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && subject.trim()) {
      handleContinue();
    }
  };

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
              Choose a Subject 📚
            </p>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-8 text-sm">
              What subject would you like to learn today? Enter any subject and
              I&apos;ll help you get started!
            </p>

            {/* Input and Button Section - Side by Side */}
            <div className="sm:flex gap-4 items-end">
              {/* Input Field */}
              <div className="flex-1">
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Mathematics, Science, English, History, Geography..."
                  className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
                />
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!subject.trim() || isLoading}
                className="sm:mt-0 mt-2 sm:w-fit w-full py-3.5 px-4 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
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
