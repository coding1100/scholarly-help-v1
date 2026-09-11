"use client";

import React, { useState } from "react";
import styles from "../homework-helper.module.css";
import type { HomeworkSessionDTO } from "../types";

interface DetectedScreenProps {
  session: HomeworkSessionDTO;
  onChange: (patch: { level?: string; subject?: string; topic?: string }) => Promise<void>;
  onContinue: () => void;
}

const DetectedScreen: React.FC<DetectedScreenProps> = ({ session, onChange, onContinue }) => {
  const [editing, setEditing] = useState(false);
  const [level, setLevel] = useState(session.level);
  const [subject, setSubject] = useState(session.subject);
  const [topic, setTopic] = useState(session.topic);

  return (
    <div>
      <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mt-1 mb-2.5`}>
        1 question found
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        <span className={`${styles.pill} ${styles.pillLevel} rounded-full px-3 py-1 text-[11.5px]`}>
          {session.level}
        </span>
        <span className={`${styles.pill} rounded-full px-3 py-1 text-[11.5px]`}>{session.subject}</span>
        <span className={`${styles.pill} rounded-full px-3 py-1 text-[11.5px]`}>{session.topic}</span>
      </div>

      <div className={`${styles.card} ${styles.serif} p-6 text-[19px] leading-relaxed mb-3`}>
        {session.question}
      </div>

      <button
        type="button"
        aria-expanded={editing}
        aria-controls="hh-detection-edit"
        className="text-[13px] font-semibold text-[var(--pen)]"
        onClick={() => setEditing((v) => !v)}
      >
        Change
      </button>

      {editing && (
        <div id="hh-detection-edit" className="mt-3.5 p-4 border border-[var(--line)] rounded-lg bg-[var(--paper)]">
          <div className="flex gap-2.5 mb-2.5">
            <div className="flex-1">
              <label className={`${styles.mono} block text-[11px] uppercase text-[var(--ink-faint)] mb-1`}>
                Academic level
              </label>
              <input
                className="w-full px-2.5 py-1.5 border border-[var(--line)] rounded-md text-[13.5px] bg-[var(--paper-raised)] text-[var(--ink)]"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={`${styles.mono} block text-[11px] uppercase text-[var(--ink-faint)] mb-1`}>
                Subject
              </label>
              <input
                className="w-full px-2.5 py-1.5 border border-[var(--line)] rounded-md text-[13.5px] bg-[var(--paper-raised)] text-[var(--ink)]"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-2.5">
            <label className={`${styles.mono} block text-[11px] uppercase text-[var(--ink-faint)] mb-1`}>
              Topic
            </label>
            <input
              className="w-full px-2.5 py-1.5 border border-[var(--line)] rounded-md text-[13.5px] bg-[var(--paper-raised)] text-[var(--ink)]"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="text-[13px] font-semibold px-3 py-1.5 rounded-md bg-[var(--pen-btn)] text-white"
            onClick={async () => {
              await onChange({ level, subject, topic });
              setEditing(false);
            }}
          >
            Save
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
          onClick={onContinue}
        >
          Let's work on this →
        </button>
      </div>
    </div>
  );
};

export default DetectedScreen;
