"use client";

import React from "react";
import styles from "../homework-helper.module.css";

interface CompleteScreenProps {
  onContinue: () => void;
  onPractice: () => void;
}

const CompleteScreen: React.FC<CompleteScreenProps> = ({ onContinue, onPractice }) => (
  <div className="text-center py-12">
    <div
      aria-hidden="true"
      className="w-14 h-14 rounded-full bg-[var(--green)] text-white flex items-center justify-center text-2xl mx-auto mb-4.5"
    >
      ✓
    </div>
    <h2 className={`${styles.serif} text-[23px] mb-1.5`}>Question complete</h2>
    <p className="text-[var(--ink-soft)] text-[14.5px] mb-6.5">
      Nice work — this one&apos;s saved to My Homework.
    </p>
    <div className="flex gap-2.5 justify-center flex-wrap">
      <button
        type="button"
        className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg border border-[var(--line)]"
        onClick={onContinue}
      >
        Continue homework
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
