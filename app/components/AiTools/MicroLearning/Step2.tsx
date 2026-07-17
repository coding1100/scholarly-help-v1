"use client";

import { useMemo, useState } from "react";

type GoalKey =
  | "career-development"
  | "skill-building"
  | "personal-growth"
  | "academic-learning"
  | "hobby-interests"
  | "professional-certification";

type Goal = {
  key: GoalKey;
  label: string;
  icon: string;
};

const goals: Goal[] = [
  { key: "career-development", label: "Career Development", icon: "💼" },
  { key: "skill-building", label: "Skill Building", icon: "🛠️" },
  { key: "personal-growth", label: "Personal Growth", icon: "🌱" },
  { key: "academic-learning", label: "Academic Learning", icon: "🎓" },
  { key: "hobby-interests", label: "Hobby & Interests", icon: "🎨" },
  {
    key: "professional-certification",
    label: "Professional Certification",
    icon: "🏆",
  },
];

interface Step2Props {
  onBack?: () => void;
  onContinue?: (selectedGoals: string[]) => void;
}

export default function Step2({ onBack, onContinue }: Step2Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customGoal, setCustomGoal] = useState("");

  const predefinedKeys = new Set<string>(goals.map((g) => g.key));
  const selectedList = useMemo(() => Array.from(selected), [selected]);
  const customAddedList = useMemo(
    () => selectedList.filter((s) => !predefinedKeys.has(s)),
    [selectedList],
  );
  const canContinue = selected.size > 0;

  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const addCustom = () => {
    const v = customGoal.trim();
    if (!v) return;
    toggle(v);
    setCustomGoal("");
  };

  return (
    <div className="flex justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-5xl">
        <div className="bg-[#F0F0F0] rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center">
            <p className="text-xl font-semibold text-[#333333] mb-3">
              What are your learning goals?{" "}
              <span className="inline-block align-middle">🎯</span>
            </p>
            <p className="text-[#666666] text-sm">Select all that apply:</p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((g) => {
              const isSelected = selected.has(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggle(g.key)}
                  className={[
                    "group rounded-2xl bg-white border transition-all duration-200",
                    "px-6 py-6 flex flex-col items-center justify-center",
                    "shadow-[0_2px_0_rgba(0,0,0,0.05)] hover:shadow-md",
                    isSelected
                      ? "border-[#6C757D] ring-2 ring-[#6C757D]/25"
                      : "border-[#D7D7D7] hover:border-[#BEBEBE]",
                  ].join(" ")}
                  aria-pressed={isSelected}
                >
                  <div className="text-3xl mb-3 opacity-90 group-hover:opacity-100">
                    {g.icon}
                  </div>
                  <div className="text-[#222222] font-medium text-base">
                    {g.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="flex sm:gap-4 gap-2">
              <input
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
                placeholder="Or add your own goal..."
                className="flex-1 px-4 py-3 rounded-lg bg-white backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={addCustom}
                className="sm:px-6 px-4 sm:py-2 py-1.5 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold sm:text-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
                aria-label="Add custom goal"
              >
                +
              </button>
            </div>
            {customAddedList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customAddedList.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#6C757D]/50 text-[#222222] text-sm font-medium shadow-sm"
                  >
                    {goal}
                    <button
                      type="button"
                      onClick={() => toggle(goal)}
                      className="ml-0.5 rounded p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none"
                      aria-label={`Remove ${goal}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 sm:flex items-center justify-between gap-4">
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
