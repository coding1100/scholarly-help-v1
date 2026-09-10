"use client";

import React, { useRef, useState } from "react";
import styles from "../homework-helper.module.css";
import QuestionHeader from "../components/QuestionHeader";
import InputToolbar from "../components/InputToolbar";
import type { CheckWorkResult, HomeworkMode, HomeworkSessionDTO } from "../types";

interface CheckWorkScreenProps {
  session: HomeworkSessionDTO;
  onCheck: (attempt: string) => Promise<CheckWorkResult>;
  onPickMode: (mode: HomeworkMode) => void;
  onComplete: () => void;
}

const CheckWorkScreen: React.FC<CheckWorkScreenProps> = ({ session, onCheck, onPickMode, onComplete }) => {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckWorkResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await onCheck(text);
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  const feedbackClass =
    result?.status === "correct"
      ? styles.feedbackCorrect
      : result?.status === "partial"
        ? styles.feedbackPartial
        : styles.feedbackWrong;

  return (
    <div>
      <QuestionHeader session={session} />
      <p className="text-[var(--ink-soft)] text-sm mb-3.5">
        Enter what you already tried, and I&apos;ll check it against the actual reasoning — not just whether
        it looks right.
      </p>
      <InputToolbar
        inputType={session.input_type}
        onInsert={(sym) => {
          setText((t) => t + sym);
          textareaRef.current?.focus();
        }}
      />
      <textarea
        ref={textareaRef}
        className="w-full min-h-[130px] p-3.5 border border-[var(--line)] rounded-lg font-mono text-sm leading-relaxed resize-y bg-[var(--paper-raised)] text-[var(--ink)]"
        placeholder="Write your attempt here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3">
        <button
          type="button"
          disabled={busy}
          aria-busy={busy}
          className="font-semibold text-[14.5px] px-4 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={submit}
        >
          {busy ? "Checking…" : "Check my work"}
        </button>
      </div>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`${feedbackClass} mt-4 px-4.5 py-4 rounded-[10px] text-[14.5px] leading-relaxed`}
          style={{ padding: "16px 18px" }}
        >
          <div className={`${styles.serif} font-bold text-base mb-1.5`}>{result.title}</div>
          <div>{result.body}</div>
          <div className="flex gap-2.5 mt-3.5 flex-wrap">
            {result.status !== "correct" && (
              <button
                type="button"
                className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)]"
                onClick={() => setResult(null)}
              >
                Try again
              </button>
            )}
            {result.status !== "correct" && (
              <button
                type="button"
                className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)]"
                onClick={() => onPickMode("explain")}
              >
                Explain my mistake
              </button>
            )}
            <button
              type="button"
              className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)]"
              onClick={() => onPickMode("solution")}
            >
              Show solution
            </button>
            {result.status === "correct" && (
              <button
                type="button"
                className="text-[13px] font-semibold px-3 py-1.5 rounded-md bg-[var(--pen-btn)] text-white"
                onClick={onComplete}
              >
                Complete question
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckWorkScreen;
