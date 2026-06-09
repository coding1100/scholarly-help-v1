/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useMemo } from "react";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import Step6 from "./step6";
import Step7 from "./step7";
import Step8 from "./step8";
import {
  useLanguagePractice,
  LanguagePracticeProvider,
} from "@/app/context/LanguagePracticeContext";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

type StepMeta = {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  title: string;
  subtitle: string;
};

const STEPS: StepMeta[] = [
  {
    step: 1,
    title: "Select Language",
    subtitle: "Pick what you want to master",
  },
  { step: 2, title: "Assessment", subtitle: "A quick warm-up so I can adapt" },
  { step: 3, title: "Goals", subtitle: "Tell me what success looks like" },
  { step: 4, title: "Vocabulary", subtitle: "Learn words you’ll actually use" },
  {
    step: 5,
    title: "Grammar",
    subtitle: "Rules that make your sentences click",
  },
  {
    step: 6,
    title: "Conversation",
    subtitle: "Real-life practice, chat-style",
  },
  {
    step: 7,
    title: "Pronunciation",
    subtitle: "Sound more natural (text-based)",
  },
  { step: 8, title: "Progress", subtitle: "Celebrate wins + next steps" },
];

function Shell() {
  const { step, setStep, language, level, goals, onboardingComplete, isAiBusy } =
    useLanguagePractice();

  const canAccess = (s: number) => {
    // Onboarding required to unlock free navigation to later steps.
    if (s <= 3) return true;
    return (
      onboardingComplete &&
      Boolean(language) &&
      Boolean(level) &&
      goals.length > 0
    );
  };

  const progressPct = useMemo(() => {
    const completed =
      (language ? 1 : 0) +
      (level ? 1 : 0) +
      (goals.length > 0 ? 1 : 0) +
      (onboardingComplete ? 1 : 0);
    // "Onboarding" is 4 internal milestones; then the rest is practice.
    return Math.round((Math.min(4, completed) / 4) * 100);
  }, [language, level, goals.length, onboardingComplete]);

  return (
    <div className="relative h-[calc(100vh-8vh)] overflow-y-auto flex justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <ToolsApiLoader show={isAiBusy} />
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-black text-white shadow-sm grid place-items-center">
                  <span className="text-sm font-semibold">LP</span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    Language Practice
                  </div>
                  <div className="text-sm text-gray-600">
                    Friendly, structured practice that adapts to you.
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                  {language ? (
                    <>
                      <span className="font-medium">Language:</span> {language}
                    </>
                  ) : (
                    "Pick a language to begin"
                  )}
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700">
                  {level ? (
                    <>
                      <span className="font-medium">Level:</span> {level}
                    </>
                  ) : (
                    "Level: TBD"
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Onboarding progress</span>
                <span className="tabular-nums">{progressPct}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-[#155dfc] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {STEPS.map((s) => {
              const active = s.step === step;
              const locked = !canAccess(s.step);
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => !locked && setStep(s.step)}
                  className={[
                    "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                    active
                      ? "border-[#155dfc] bg-[#155dfc] text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    locked
                      ? "opacity-50 cursor-not-allowed hover:bg-white"
                      : "",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                  title={locked ? "Finish onboarding to unlock" : s.subtitle}
                >
                  <span
                    className={[
                      "grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold",
                      active ? "bg-white/15" : "bg-gray-100 text-gray-700",
                    ].join(" ")}
                  >
                    {s.step}
                  </span>
                  <span className="font-medium">{s.title}</span>
                </button>
              );
            })}
          </nav>
        </header>

        <main className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-gray-500">
                Step {step} of 8
              </div>
              <div className="text-xl font-semibold tracking-tight">
                {STEPS.find((s) => s.step === step)?.title}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {STEPS.find((s) => s.step === step)?.subtitle}
              </div>
            </div>
          </div>

          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
          {step === 6 && <Step6 />}
          {step === 7 && <Step7 />}
          {step === 8 && <Step8 />}
        </main>
      </div>
    </div>
  );
}

export default function LanguageFlow() {
  return (
    <LanguagePracticeProvider>
      <Shell />
    </LanguagePracticeProvider>
  );
}
