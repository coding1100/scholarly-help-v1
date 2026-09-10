"use client";

import React, { useState } from "react";
import styles from "../homework-helper.module.css";
import type { HomeworkMode, HomeworkSessionDTO } from "../types";

interface ModeSelectScreenProps {
  session: HomeworkSessionDTO;
  onPickMode: (mode: HomeworkMode) => void;
}

const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({ session, onPickMode }) => {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div>
      <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1`}>
        {session.subject} · {session.topic}
      </div>
      <h1 className={`${styles.serif} text-[26px] font-bold tracking-tight mt-1 mb-1.5`}>
        How would you like to work on this?
      </h1>
      <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed mb-5">{session.question}</p>

      <button
        type="button"
        onClick={() => onPickMode("stepbystep")}
        className={`${styles.card} block w-full text-left p-5 mb-2.5 border-[1.5px] border-[var(--pen)] hover:-translate-y-px transition-transform`}
      >
        <div className={`${styles.mono} text-[10.5px] uppercase tracking-wide text-[var(--pen)] mb-1`}>
          Recommended
        </div>
        <div className={`${styles.serif} text-lg font-semibold`}>Step-by-step</div>
        <div className="text-[13.5px] text-[var(--ink-soft)] mt-1">Break it down for me.</div>
      </button>

      <button
        type="button"
        onClick={() => onPickMode("socratic")}
        className={`${styles.card} block w-full text-left p-4 mb-4`}
      >
        <div className={`${styles.serif} text-[16.5px] font-semibold`}>Socratic</div>
        <div className="text-[13.5px] text-[var(--ink-soft)] mt-1">Let me figure it out.</div>
      </button>

      <button
        type="button"
        aria-expanded={moreOpen}
        aria-controls="hh-more-ways"
        onClick={() => setMoreOpen((v) => !v)}
        className="text-[13.5px] text-[var(--ink-soft)] font-semibold flex items-center gap-1.5 py-1.5"
      >
        More ways to work <span aria-hidden="true">{moreOpen ? "▴" : "▾"}</span>
      </button>

      {moreOpen && (
        <div id="hh-more-ways" className="mt-2.5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onPickMode("explain")}
            className="text-left rounded-lg border border-[var(--line-soft)] px-4 py-3 text-sm font-medium"
          >
            Explain
            <small className="block font-normal text-[var(--ink-faint)] text-xs mt-0.5">
              Understand the concept behind this question first.
            </small>
          </button>
          <button
            type="button"
            onClick={() => onPickMode("checkwork")}
            className="text-left rounded-lg border border-[var(--line-soft)] px-4 py-3 text-sm font-medium"
          >
            Check my work
            <small className="block font-normal text-[var(--ink-faint)] text-xs mt-0.5">
              I already tried it — tell me how I did.
            </small>
          </button>
          <button
            type="button"
            onClick={() => onPickMode("solution")}
            className="text-left rounded-lg border border-[var(--line-soft)] px-4 py-3 text-sm font-medium"
          >
            Show solution
            <small className="block font-normal text-[var(--ink-faint)] text-xs mt-0.5">
              Just show me the full worked answer.
            </small>
          </button>
        </div>
      )}
    </div>
  );
};

export default ModeSelectScreen;
