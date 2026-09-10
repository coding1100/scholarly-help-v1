"use client";

import React, { useEffect, useState } from "react";
import styles from "../homework-helper.module.css";

const STEPS = ["Reading question", "Detecting subject", "Identifying topic", "Checking academic level"];

/**
 * Purely a perceived-progress indicator: the checklist reveals on a timer
 * while the ONE real detect request resolves in the background (the parent
 * swaps this screen out the moment that request settles), not four separate
 * fake delays each gated behind its own network call.
 */
const AnalyzingScreen: React.FC = () => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= STEPS.length) return;
    const timer = setTimeout(() => setShown((n) => n + 1), 480);
    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <div className="text-center py-16">
      <div className={`${styles.spin} w-9 h-9 rounded-full mx-auto mb-6`} />
      <div className={`${styles.serif} text-[17px] mb-5`}>Analyzing your upload…</div>
      <div className="max-w-[280px] mx-auto text-left">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 py-1.5 text-sm transition-all duration-300 ${
              i < shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            } ${i < shown - 1 || shown >= STEPS.length ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`}
          >
            <span className="w-4 text-[var(--green)] font-bold">
              {i < shown - 1 || shown >= STEPS.length ? "✓" : ""}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyzingScreen;
