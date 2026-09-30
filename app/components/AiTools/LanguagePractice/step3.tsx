"use client";

import React, { useMemo } from "react";
import {
  Goal,
  useLanguagePractice,
} from "@/app/context/LanguagePracticeContext";

const ALL_GOALS: { key: Goal; title: string; desc: string }[] = [
  {
    key: "Travel",
    title: "Travel",
    desc: "Order food, ask directions, small talk",
  },
  {
    key: "Work",
    title: "Work",
    desc: "Emails, meetings, professional phrasing",
  },
  { key: "Exams", title: "Exams", desc: "Grammar accuracy + test-like tasks" },
  {
    key: "Casual conversation",
    title: "Casual conversation",
    desc: "Friends, hobbies, everyday life",
  },
];

function Chip({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left shadow-sm transition",
        active
          ? "border-[#155dfc] bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-gray-600">{subtitle}</div>
        </div>
        <div
          className={[
            "mt-0.5 min-h-6 min-w-6 h-6 w-6 rounded-xl border grid place-items-center text-xs font-bold",
            active
              ? "border-[#155dfc] bg-[#155dfc] text-white"
              : "border-gray-300 bg-white text-gray-600",
          ].join(" ")}
          aria-hidden="true"
        >
          {active ? "✓" : "+"}
        </div>
      </div>
    </button>
  );
}

export default function Step3() {
  const { language, level, goals, setGoals, setStep, setOnboardingComplete } =
    useLanguagePractice();

  const toggle = (g: Goal) => {
    if (goals.includes(g)) setGoals(goals.filter((x) => x !== g));
    else setGoals([...goals, g]);
  };

  const canContinue = goals.length > 0;

  // Automatically complete onboarding when user has language, level, and goals
  React.useEffect(() => {
    if (language && level && goals.length > 0) {
      setOnboardingComplete(true);
    }
  }, [language, level, goals.length, setOnboardingComplete]);

  const helper = useMemo(() => {
    if (!language)
      return "Pick a language first — then we'll tailor your goals.";
    if (!level)
      return "Do a quick assessment, then choose goals to personalize practice.";
    return "Choose 1–3 goals. You can change these anytime.";
  }, [language, level]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
        <div className="text-sm font-semibold">What are we practicing for?</div>
        <div className="mt-1 text-sm text-gray-600">{helper}</div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700">
            <span className="font-semibold">Language:</span>{" "}
            {language ?? "Not set"}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700">
            <span className="font-semibold">Level:</span> {level ?? "TBD"}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700">
            <span className="font-semibold">Goals:</span> {goals.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ALL_GOALS.map((g) => (
          <Chip
            key={g.key}
            active={goals.includes(g.key)}
            title={g.title}
            subtitle={g.desc}
            onClick={() => toggle(g.key)}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Your practice plan</div>
        <div className="mt-1 text-sm text-gray-600">
          {goals.length > 0 ? (
            <>
              We&apos;ll focus on:{" "}
              <span className="font-semibold">{goals.join(", ")}</span>.
            </>
          ) : (
            "Pick at least one goal to continue."
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep(4)}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
            canContinue
              ? "bg-[#155dfc] text-white hover:bg-[#1447e6]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed",
          ].join(" ")}
        >
          Continue to vocabulary
        </button>
      </div>
    </div>
  );
}
