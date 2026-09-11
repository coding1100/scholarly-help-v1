"use client";

import React from "react";
import styles from "../homework-helper.module.css";

interface CompleteScreenProps {
  onContinue: () => void;
  onPractice: () => void;
  /** True when this question was part of a multi-question worksheet queue and another one follows. */
  hasNext?: boolean;
}

const CompleteScreen: React.FC<CompleteScreenProps> = ({ onContinue, onPractice, hasNext }) => (
  <div className="text-center py-12">
    <div
      aria-hidden="true"
      className="w-14 h-14 rounded-full bg-[var(--green)] text-white flex items-center justify-center text-2xl mx-auto mb-4.5"
    >
      ✓
    </div>
    <h2 className={`${styles.serif} text-[23px] mb-1.5`}>Question complete</h2>
    <p className="text-[var(--ink-soft)] text-[14.5px] mb-6.5">
      {hasNext
        ? "Nice work, this one's saved. On to the next question."
        : "Nice work, this one's saved to My Homework."}
    </p>
    <div className="flex gap-2.5 justify-center flex-wrap">
      <button
        type="button"
        className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg border border-[var(--line)]"
        onClick={onContinue}
      >
        {hasNext ? "Next question →" : "Continue homework"}
      </button>
      <button
        type="button"
        className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
        onClick={onPractice}
      >
        Practice this concept
      </button>
    </div>
  </div>
);

export default CompleteScreen;
