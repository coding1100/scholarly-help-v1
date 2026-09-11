"use client";

import React from "react";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import type { HomeworkSessionDTO } from "../types";

interface QuestionHeaderProps {
  session: HomeworkSessionDTO;
  sticky?: boolean;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ session, sticky = true }) => (
  // Sticks to the top of the tool's own scroll container (ToolWithExplore's
  // <main className="overflow-y-auto">). ToolHeader above it is a normal
  // flex sibling, not fixed/sticky itself, so it scrolls away with the page
  // — there is no persistent header height to offset past, hence top-0.
  <div
    className={`${styles.card} ${styles.serif} p-4 text-[16.5px] leading-relaxed mb-3.5 ${
      sticky ? "sticky top-0 z-10" : ""
    }`}
  >
    <div className={`${styles.mono} text-[10.5px] uppercase text-[var(--ink-faint)] mb-1.5 tracking-wide`}>
      {session.subject} · {session.topic}
    </div>
    <MathProse text={session.question} />
  </div>
);

export default QuestionHeader;
