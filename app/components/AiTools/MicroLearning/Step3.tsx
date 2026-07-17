"use client";

import { useMemo, useState } from "react";

type DurationKey = "5" | "10" | "15";

type DurationOption = {
  key: DurationKey;
  title: string;
  subtitle: string;
};

const options: DurationOption[] = [
  { key: "5", title: "5 min", subtitle: "Quick Learn" },
  { key: "10", title: "10 min", subtitle: "Standard" },
  { key: "15", title: "15 min", subtitle: "Deep Dive" },
];

interface Step3Props {
  onBack?: () => void;
  onContinue?: (minutesPerDay: number) => void;
}

export default function Step3({ onBack, onContinue }: Step3Props) {
  const [selected, setSelected] = useState<DurationKey | null>(null);
  const canContinue = selected !== null;

  const minutes = useMemo(() => {
    if (!selected) return null;
    return Number(selected);
  }, [selected]);

  return (
    <div className="flex justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-5xl">
        <div className="bg-[#F0F0F0] rounded-3xl p-10 md:p-14 shadow-2xl">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-[#333333] mb-3">
              How much time do you have per day?{" "}
              <span className="inline-block align-middle">⏰</span>
            </h1>
            <p className="text-[#666666] text-sm">
              Choose your preferred learning duration:
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6">
              {options.map((opt) => {
                const isSelected = selected === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelected(opt.key)}
                    className={[
                      "rounded-xl bg-white border transition-all duration-200",
                      "px-6 py-6 flex flex-col items-center justify-center",
                      "shadow-[0_2px_0_rgba(0,0,0,0.05)] hover:shadow-md",
                      isSelected
                        ? "border-[#6C757D] ring-2 ring-[#6C757D]/25"
                        : "border-[#D7D7D7] hover:border-[#BEBEBE]",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    <div className="text-2xl font-bold text-[#111111]">
                      {opt.title}
                    </div>
                    <div className="mt-2 text-[#333333] font-medium">
                      {opt.subtitle}
                    </div>
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
              disabled={!canContinue}
              onClick={() => {
                if (!minutes) return;
                onContinue?.(minutes);
              }}
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
