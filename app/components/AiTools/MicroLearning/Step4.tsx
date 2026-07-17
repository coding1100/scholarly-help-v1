"use client";

import { useMemo, useState } from "react";

const popularTopics = [
  "Python",
  "JavaScript",
  "Marketing",
  "Design",
  "Business",
  "History",
  "Science",
  "Languages",
  "Photography",
  "Cooking",
];

interface Step4Props {
  onBack?: () => void;
  onContinue?: (selectedTopics: string[]) => void;
}

export default function Step4({ onBack, onContinue }: Step4Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customTopic, setCustomTopic] = useState("");

  const selectedList = useMemo(() => Array.from(selected), [selected]);
  const canContinue = selected.size > 0;

  const toggle = (topic: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const addCustom = () => {
    const trimmed = customTopic.trim();
    if (!trimmed) return;
    toggle(trimmed);
    setCustomTopic("");
  };

  return (
    <div className="flex justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-5xl">
        <div className="bg-[#F0F0F0] rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center">
            <p className="text-xl font-semibold text-[#333333] mb-3">
              What topics interest you?{" "}
              <span className="inline-block align-middle">📘</span>
            </p>
            <p className="text-[#666666] text-sm">
              Select topics you'd like to learn about:
            </p>
          </div>

          <div className="mt-6">
            <div className="flex sm:gap-4 gap-2">
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
                placeholder="Enter a topic (e.g., Python, Marketing, History...)"
                className="flex-1 px-4 py-3 rounded-lg bg-white backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={addCustom}
                className="sm:px-6 px-4 sm:py-2 py-1.5 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold sm:text-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Selected Topics Display */}
          {selected.size > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                {selectedList.map((topic) => (
                  <div
                    key={topic}
                    className="px-4 py-2 rounded-full bg-linear-to-r from-[#6C757D] to-[#868E96] text-black text-sm font-medium flex items-center gap-2 shadow-md"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => toggle(topic)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${topic}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-[#333333] font-semibold mb-4">Popular topics:</p>
            <div className="flex flex-wrap gap-3">
              {popularTopics.map((topic) => {
                const isSelected = selected.has(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggle(topic)}
                    className={[
                      "text-sm px-5 py-2.5 rounded-full bg-white border border-[#D7D7D7] transition-all duration-200",
                      "text-[#222222] font-medium shadow-[0_2px_0_rgba(0,0,0,0.05)]",
                      "hover:shadow-md hover:border-[#BEBEBE]",
                      isSelected && "opacity-60",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 sm:flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="sm:w-fit w-full h-10 px-10 rounded-lg border-2 border-[#6C757D] text-[#6C757D] font-semibold bg-transparent hover:bg-[#6C757D]/10 transition-all duration-200"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => onContinue?.(selectedList)}
              disabled={!canContinue}
              className={[
                "sm:w-fit w-full sm:mt-0 mt-2 h-10 px-12 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer",
                canContinue
                  ? "bg-linear-to-r from-[#6C757D] to-[#868E96] shadow-lg hover:shadow-xl active:scale-[0.99]"
                  : "bg-[#B9BFC5] cursor-not-allowed opacity-80",
              ].join(" ")}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
