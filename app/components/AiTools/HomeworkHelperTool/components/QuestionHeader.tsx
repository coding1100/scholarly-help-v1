"use client";

import React from "react";
import styles from "../homework-helper.module.css";
import type { HomeworkSessionDTO } from "../types";

interface QuestionHeaderProps {
  session: HomeworkSessionDTO;
  sticky?: boolean;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ session, sticky = true }) => (
  <div
    className={`${styles.card} ${styles.serif} p-4 text-[16.5px] leading-relaxed mb-3.5 ${
      sticky ? "sticky top-[64px] z-10" : ""
    }`}
  >
    <div className={`${styles.mono} text-[10.5px] uppercase text-[var(--ink-faint)] mb-1.5 tracking-wide`}>
      {session.subject} · {session.topic}
    </div>
    {session.question}
  </div>
);

export default QuestionHeader;
