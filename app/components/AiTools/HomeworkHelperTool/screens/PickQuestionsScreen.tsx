"use client";

import React, { useState } from "react";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import type { DetectedQuestionDTO } from "../types";

interface PickQuestionsScreenProps {
  questions: DetectedQuestionDTO[];
  onContinue: (selectedIndices: number[]) => void;
  onBack: () => void;
}

const PickQuestionsScreen: React.FC<PickQuestionsScreenProps> = ({
  questions,
  onContinue,
  onBack,
}) => {
  const [selected, setSelected] = useState<Set<number>>(new Set(questions.map((q) => q.index)));

  const allSelected = selected.size === questions.length;

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(questions.map((q) => q.index)));
  };

  return (
    <div>
      <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1`}>
        {questions.length} question{questions.length === 1 ? "" : "s"} found
      </div>
      <h1 className={`${styles.serif} text-[26px] font-bold tracking-tight mt-1 mb-1.5`}>
        Which question{questions.length === 1 ? "" : "s"} do you want to work on?
      </h1>
      <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed mb-4">
        {questions.length > 1
          ? "This looks like a worksheet with more than one question. Pick one, several, or select all — you'll work through them one at a time."
          : "Confirm this is the question you want help with."}
      </p>

      {questions.length > 1 && (
        <button
          type="button"
          onClick={toggleAll}
          className="text-[13px] font-semibold text-[var(--pen)] mb-3"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      )}

      <div role="group" aria-label="Questions found">
        {questions.map((q) => {
          const isChecked = selected.has(q.index);
          return (
            <label
              key={q.index}
              className={`${styles.card} flex items-start gap-3 p-4 mb-2.5 cursor-pointer ${
                isChecked ? styles.stepCardCurrent : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(q.index)}
                className="mt-1 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex gap-2 flex-wrap mb-1.5">
                  <span className={`${styles.pill} ${styles.pillLevel} rounded-full px-2.5 py-0.5 text-[10.5px]`}>
                    {q.level}
                  </span>
                  <span className={`${styles.pill} rounded-full px-2.5 py-0.5 text-[10.5px]`}>{q.subject}</span>
                  <span className={`${styles.pill} rounded-full px-2.5 py-0.5 text-[10.5px]`}>{q.topic}</span>
                </div>
                <MathProse text={q.question} className={`${styles.serif} block text-[15px] leading-relaxed`} />
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex gap-2.5 mt-5 flex-wrap">
        <button
          type="button"
          className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg border border-[var(--line)]"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={selected.size === 0}
          className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onContinue(Array.from(selected).sort((a, b) => a - b))}
        >
          {selected.size > 1 ? `Work on ${selected.size} questions →` : "Let's work on this →"}
        </button>
      </div>
    </div>
  );
};

export default PickQuestionsScreen;
