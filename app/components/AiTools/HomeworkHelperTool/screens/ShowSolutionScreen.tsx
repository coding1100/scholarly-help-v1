"use client";

import React from "react";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import QuestionHeader from "../components/QuestionHeader";
import type { HomeworkSessionDTO } from "../types";

interface ShowSolutionScreenProps {
  session: HomeworkSessionDTO;
  onComplete: () => void;
}

const ShowSolutionScreen: React.FC<ShowSolutionScreenProps> = ({ session, onComplete }) => {
  const steps = session.content.stepByStep || [];

  return (
    <div>
      <QuestionHeader session={session} />
      <div>
        {steps.map((step, i) => (
          <div key={i} className={`${styles.card} p-4.5 mb-2.5`} style={{ padding: "18px 20px" }}>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-full bg-[var(--green)] text-white flex items-center justify-center text-[11px] shrink-0"
              >
                ✓
              </span>
              <span className={`${styles.serif} font-semibold text-[16px]`}>{step.title}</span>
            </div>
            <MathProse text={step.body} allowHtml className="block text-[14.5px] leading-relaxed pl-[29px]" />
            {step.formula && (
              <div className={`${styles.formula} text-[14.5px] rounded-md px-3.5 py-2 my-2 ml-[29px] inline-block`}>
                <MathProse text={step.formula} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={`${styles.feedbackCorrect} rounded-[10px] px-5 py-4.5 my-4 text-center`}>
        <div className="font-mono text-[11px] uppercase tracking-wide">Answer</div>
        <MathProse text={session.answer} className={`${styles.serif} block text-[26px] font-bold mt-1`} />
      </div>
      <button
        type="button"
        className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
        onClick={onComplete}
      >
        Complete question
      </button>
    </div>
  );
};

export default ShowSolutionScreen;
