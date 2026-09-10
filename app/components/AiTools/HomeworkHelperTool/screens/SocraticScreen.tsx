"use client";

import React, { useRef, useState } from "react";
import styles from "../homework-helper.module.css";
import QuestionHeader from "../components/QuestionHeader";
import InputToolbar from "../components/InputToolbar";
import type { HomeworkSessionDTO } from "../types";

interface SocraticScreenProps {
  session: HomeworkSessionDTO;
  onAnswer: (questionIndex: number, answer: string) => Promise<{ correct: boolean; feedback: string }>;
  onHint: (questionIndex: number) => Promise<{ hints: string[] }>;
  onComplete: () => void;
}

const SocraticScreen: React.FC<SocraticScreenProps> = ({ session, onAnswer, onHint, onComplete }) => {
  const questions = session.content.socratic || [];
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [shownHints, setShownHints] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!questions.length) {
    return (
      <div>
        <QuestionHeader session={session} />
        <div className="text-[var(--ink-faint)] text-sm italic">No questions generated yet.</div>
      </div>
    );
  }

  const current = questions[index];

  const submit = async () => {
    const value = inputRef.current?.value.trim();
    if (!value) return;
    setBusy(true);
    try {
      const result = await onAnswer(index, value);
      setFeedback({ correct: result.correct, msg: result.feedback });
    } finally {
      setBusy(false);
    }
  };

  const requestHint = async () => {
    if (!hints.length) {
      const result = await onHint(index);
      setHints(result.hints || []);
      setShownHints(1);
    } else if (shownHints < hints.length) {
      setShownHints((n) => n + 1);
    }
  };

  const next = () => {
    setIndex((n) => n + 1);
    setFeedback(null);
    setHints([]);
    setShownHints(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <QuestionHeader session={session} />

      {questions.slice(0, index + 1).map((q, i) => {
        const isCurrent = i === index;
        const solved = i < index || (isCurrent && feedback?.correct);
        return (
          <div key={i} className="mb-3.5">
            <div className={`${styles.aiBubble} px-4 py-3 text-[14.5px] leading-relaxed max-w-[88%] mb-2`}>
              {q.q}
            </div>
            {solved && !isCurrent && (
              <div className={`${styles.feedbackCorrect} mt-2 px-3.5 py-2.5 rounded-lg text-[13.5px] leading-relaxed max-w-[88%]`}>
                ✓ {q.correct_msg}
              </div>
            )}
            {isCurrent && !feedback?.correct && (
              <>
                <div className="max-w-[88%]">
                  <InputToolbar inputType={session.input_type} onInsert={(sym) => {
                    if (inputRef.current) {
                      inputRef.current.value += sym;
                      inputRef.current.focus();
                    }
                  }} compact />
                </div>
                <div className="flex gap-2 max-w-[88%]">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your answer..."
                    disabled={busy}
                    className="flex-1 px-3 py-2 border border-[var(--line)] rounded-lg text-sm bg-[var(--paper-raised)] text-[var(--ink)] disabled:opacity-60"
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    aria-busy={busy}
                    className="text-[13.5px] font-semibold px-3.5 py-2 rounded-lg bg-[var(--pen-btn)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submit}
                  >
                    {busy ? "Checking…" : "Check"}
                  </button>
                </div>
                <div className="flex gap-3.5 mt-2 items-center">
                  <button
                    type="button"
                    className="text-[13.5px] font-semibold text-[var(--pen)]"
                    onClick={requestHint}
                  >
                    Need a hint?
                  </button>
                </div>
              </>
            )}
            {isCurrent && feedback && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-2 px-3.5 py-2.5 rounded-lg text-[13.5px] leading-relaxed max-w-[88%] ${
                  feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong
                }`}
              >
                {feedback.correct ? "✓ " : ""}
                {feedback.msg}
              </div>
            )}
            {isCurrent &&
              hints.slice(0, shownHints).map((h, hi) => (
                <div key={hi} className={`${styles.feedbackPartial} mt-2 px-3.5 py-2.5 rounded-lg text-[13px] max-w-[88%]`}>
                  {h}
                </div>
              ))}
            {isCurrent && feedback?.correct && (
              <div className="mt-1.5">
                <button
                  type="button"
                  className="text-[13.5px] font-semibold px-3.5 py-1.5 rounded-md border border-[var(--line)]"
                  onClick={next}
                >
                  Next question →
                </button>
              </div>
            )}
          </div>
        );
      })}

      {index >= questions.length && (
        <>
          <div className={`${styles.feedbackCorrect} rounded-[10px] px-5 py-4.5 my-4 text-center`}>
            <div className="font-mono text-[11px] uppercase tracking-wide">Answer</div>
            <div className={`${styles.serif} text-[26px] font-bold mt-1`}>{session.answer}</div>
          </div>
          <button
            type="button"
            className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
            onClick={onComplete}
          >
            Complete question
          </button>
        </>
      )}
    </div>
  );
};

export default SocraticScreen;
