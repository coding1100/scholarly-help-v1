"use client";

import React from "react";
import toast from "react-hot-toast";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import QuestionHeader from "../components/QuestionHeader";
import type { HomeworkMode, HomeworkSessionDTO } from "../types";

interface ExplainScreenProps {
  session: HomeworkSessionDTO;
  onPickMode: (mode: HomeworkMode) => void;
}

const ExplainScreen: React.FC<ExplainScreenProps> = ({ session, onPickMode }) => {
  const explain = session.content.explain;

  return (
    <div>
      <QuestionHeader session={session} />
      <div className={`${styles.card} p-5.5 text-[15px] leading-relaxed`} style={{ padding: "22px" }}>
        <MathProse
          text={explain?.concept_name || session.method}
          className={`${styles.serif} block font-bold text-[19px] mb-2.5`}
        />
        <MathProse text={explain?.body || ""} className="block" />
        <div className="mt-5 p-3.5 bg-[var(--paper)] border border-dashed border-[var(--line)] rounded-lg text-[13.5px] flex justify-between items-center gap-2.5 flex-wrap">
          <span>Want to learn this concept more deeply?</span>
          <button
            type="button"
            className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)]"
            onClick={() => toast("This would open AI Tutor — a separate, deeper-learning product.")}
          >
            Open AI Tutor
          </button>
        </div>
      </div>
      <div className="flex gap-2.5 mt-4 flex-wrap">
        <button
          type="button"
          className="font-semibold text-[14.5px] px-4 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
          onClick={() => onPickMode("stepbystep")}
        >
          Work through the steps
        </button>
        <button
          type="button"
          className="font-semibold text-[14.5px] px-4 py-2.5 rounded-lg border border-[var(--line)]"
          onClick={() => onPickMode("socratic")}
        >
          Solve it myself
        </button>
      </div>
    </div>
  );
};

export default ExplainScreen;
