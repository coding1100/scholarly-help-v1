"use client";

import { useState } from "react";

interface Step1Props {
  onContinue?: (childName: string) => void;
  isLoading?: boolean;
}

export default function Step1({ onContinue, isLoading = false }: Step1Props) {
  const [childName, setChildName] = useState("");

  const handleContinue = () => {
    if (childName.trim()) {
      onContinue?.(childName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && childName.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md relative">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Title */}
            <p className="text-xl font-semibold text-black text-center mb-3 leading-tight">
              Welcome to Your Personal Tutor! 👋
            </p>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-8 text-sm">
              Let&apos;s start by getting to know your child better.
            </p>

            {/* Input Section */}
            <div className="mb-4">
              <label
                htmlFor="childName"
                className="block text-black font-semibold mb-1 text-sm"
              >
                Child&apos;s Name
              </label>

              <input
                id="childName"
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your child's name"
                className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
              />
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!childName.trim() || isLoading}
              className="w-full py-3 rounded-lg bg-[#565add] hover:bg-[#6267ff] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
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
  );
}
