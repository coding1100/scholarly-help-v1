"use client";

import React, { useEffect, useRef, useState } from "react";
import MathProse from "@/app/components/AiTools/shared/MathProse";
import styles from "../homework-helper.module.css";
import InputToolbar from "../components/InputToolbar";
import type { HomeworkSessionDTO, PracticeQuestionDTO } from "../types";

interface PracticeScreenProps {
  session: HomeworkSessionDTO;
  onGenerate: () => Promise<{ questions: PracticeQuestionDTO[] }>;
  onAnswer: (questionIndex: number, answer: string) => Promise<{ correct: boolean; solution: string }>;
  onDone: () => void;
  onPracticeAgain: () => void;
}

interface PerQuestionState {
  checked: boolean;
  correct: boolean;
  hintShown: boolean;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
  session,
  onGenerate,
  onAnswer,
  onDone,
  onPracticeAgain,
}) => {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestionDTO[]>(session.content.practiceSet || []);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [perQuestion, setPerQuestion] = useState<Record<number, PerQuestionState>>({});
  const [solutionText, setSolutionText] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuestions(session.content.practiceSet || []);
  }, [session.content.practiceSet]);

  const start = async () => {
    setStarted(true);
    if (!questions.length) {
      setLoading(true);
      try {
        const result = await onGenerate();
        setQuestions(result.questions);
      } finally {
        setLoading(false);
      }
    }
  };

  const checkAnswer = async () => {
    const value = inputRef.current?.value.trim();
    if (!value) return;
    setLoading(true);
    try {
      const result = await onAnswer(index, value);
      if (result.correct) setCorrectCount((n) => n + 1);
      setPerQuestion((prev) => ({ ...prev, [index]: { checked: true, correct: result.correct, hintShown: prev[index]?.hintShown || false } }));
      setSolutionText((prev) => ({ ...prev, [index]: result.solution }));
    } finally {
      setLoading(false);
    }
  };

  const showHint = () => {
    setPerQuestion((prev) => ({ ...prev, [index]: { ...(prev[index] || { checked: false, correct: false }), hintShown: true } }));
  };

  const retry = () => {
    setPerQuestion((prev) => ({ ...prev, [index]: { checked: false, correct: false, hintShown: prev[index]?.hintShown || false } }));
    if (inputRef.current) inputRef.current.value = "";
  };

  const next = () => {
    setIndex((n) => n + 1);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!started) {
    return (
      <div>
        <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1`}>
          {session.subject} · {session.topic}
        </div>
        <h1 className={`${styles.serif} text-2xl font-bold mt-1 mb-1.5`}>Practice — {session.method}</h1>
        <p className="text-[var(--ink-soft)] text-[15px] mb-5">
          Try questions similar to the one you just completed.
        </p>
        <button
          type="button"
          className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
          onClick={start}
        >
          Start practice →
        </button>
      </div>
    );
  }

  if (loading && !questions.length) {
    return <div className="text-center py-16 text-[var(--ink-faint)] text-sm">Generating practice questions…</div>;
  }

  if (index >= questions.length && questions.length > 0) {
    const total = questions.length;
    const struggling = correctCount <= Math.floor(total / 3);
    const msg =
      correctCount === total
        ? "You seem comfortable with this concept."
        : correctCount === 0
          ? "You may need more practice with this concept."
          : "You're getting there — a bit more practice will help.";
    return (
      <div className="text-center py-10">
        <div className={`${styles.serif} text-[38px] font-bold text-[var(--pen)] mb-2`}>
          {correctCount} / {total}
        </div>
        <div className={`${styles.serif} text-lg mb-6`}>{msg}</div>
        {struggling && (
          <div className="max-w-[420px] mx-auto mb-6 text-left p-3.5 bg-[var(--paper)] border border-dashed border-[var(--line)] rounded-lg text-[13.5px] flex justify-between items-center gap-2.5 flex-wrap">
            <span>Still stuck? A slower, ground-up walkthrough might help more than another quick problem.</span>
          </div>
        )}
        <div className="flex gap-2.5 justify-center flex-wrap">
          <button
            type="button"
            className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg border border-[var(--line)]"
            onClick={onPracticeAgain}
          >
            Practice again
          </button>
          <button
            type="button"
            className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg bg-[var(--pen-btn)] text-white"
            onClick={onDone}
          >
            Continue homework
          </button>
        </div>
      </div>
    );
  }

  const pq = questions[index];
  const state = perQuestion[index];

  return (
    <div>
      <div
        className="flex gap-1.5 mb-4"
        role="img"
        aria-label={`Practice question ${index + 1} of ${questions.length}`}
      >
        {questions.map((_, i) => {
          let bg = "bg-[var(--line)]";
          let label = "Not yet answered";
          if (i === index) {
            bg = "bg-[var(--pen)]";
            label = "Current question";
          } else if (perQuestion[i]?.checked) {
            bg = perQuestion[i]?.correct ? "bg-[var(--green)]" : "bg-[var(--red)]";
            label = perQuestion[i]?.correct ? "Answered correctly" : "Answered incorrectly";
          }
          return <span key={i} title={`Question ${i + 1}: ${label}`} className={`w-2.5 h-2.5 rounded-full ${bg}`} />;
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Question {index + 1} of {questions.length}
      </p>
      <MathProse
        text={pq.q}
        className={`${styles.card} ${styles.serif} block p-4.5 text-[17px] mb-3.5`}
        style={{ padding: "18px 20px" }}
      />

      {!state?.checked ? (
        <>
          <InputToolbar
            inputType={session.input_type}
            onInsert={(sym) => {
              if (inputRef.current) {
                inputRef.current.value += sym;
                inputRef.current.focus();
              }
            }}
            compact
          />
          <div className="flex gap-2 mb-2.5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Your answer..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-[var(--line)] rounded-lg text-sm font-mono bg-[var(--paper-raised)] text-[var(--ink)] disabled:opacity-60"
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            />
            <button
              type="button"
              disabled={loading}
              aria-busy={loading}
              className="text-[13.5px] font-semibold px-3.5 py-2 rounded-lg bg-[var(--pen-btn)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={checkAnswer}
            >
              {loading ? "Checking…" : "Check answer"}
            </button>
          </div>
          {state?.hintShown && (
            <MathProse
              text={pq.hint}
              className={`${styles.feedbackPartial} block px-3.5 py-2.5 rounded-lg text-[13px] mb-2`}
            />
          )}
          <button type="button" className="text-[13.5px] font-semibold text-[var(--pen)]" onClick={showHint}>
            Hint
          </button>
        </>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className={`${state.correct ? styles.feedbackCorrect : styles.feedbackWrong} px-4.5 py-4 rounded-[10px]`}
          style={{ padding: "16px 18px" }}
        >
          <div className={`${styles.serif} font-bold text-base mb-1`}>
            {state.correct ? (
              <>
                Correct <span aria-hidden="true">✓</span>
              </>
            ) : (
              "Not quite"
            )}
          </div>
          <MathProse
            text={state.correct ? "Nice — that's right." : solutionText[index] || pq.solution}
            className="block text-[14.5px]"
          />
          <div className="flex gap-2.5 mt-3.5 flex-wrap">
            {!state.correct && (
              <button type="button" className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)]" onClick={retry}>
                Try again
              </button>
            )}
            <button
              type="button"
              className="text-[13px] font-semibold px-3 py-1.5 rounded-md bg-[var(--pen-btn)] text-white"
              onClick={next}
            >
              {index < questions.length - 1 ? "Next question →" : "See results →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeScreen;
