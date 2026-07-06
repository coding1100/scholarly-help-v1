"use client";

import { Dispatch, SetStateAction } from "react";
import { FiCheck, FiX } from "react-icons/fi";

type QuizItem = {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: string;
  questionType?: string;
};

function decodeText(input: string) {
  if (!input) return input;
  return input
    .replace(/&#(\d{1,7});/g, (_, dec: string) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return _;
      }
    })
    .replace(/&amp;/g, "&");
}

function getOptionStyle(selected: boolean, correct: boolean, showFeedback: boolean) {
  if (!showFeedback) {
    return selected
      ? "border-2 border-[#5f70ff] bg-[#eef1ff] text-[#2f3a9e] shadow-sm"
      : "border border-[#e8e9f6] bg-white text-[#4f5373] hover:border-[#c9d1ff]";
  }

  if (correct) {
    // Covers both "correct & selected" and "correct & not selected".
    return "border-2 border-[#10b981] bg-[#ecfdf5] text-[#064e3b] shadow-sm";
  }
  if (selected) {
    return "border-2 border-[#ef4444] bg-[#fef2f2] text-[#7f1d1d] shadow-sm";
  }
  return "border border-[#e8e9f6] bg-white text-[#8b8faa] opacity-80";
}

function OptionBadge({
  selected,
  correct,
  showFeedback,
}: {
  selected: boolean;
  correct: boolean;
  showFeedback: boolean;
}) {
  if (!showFeedback) return null;

  if (correct && selected) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        <FiCheck className="h-3 w-3" />
        Your answer · Correct
      </span>
    );
  }

  if (correct) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        <FiCheck className="h-3 w-3" />
        Correct answer
      </span>
    );
  }

  if (selected) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        <FiX className="h-3 w-3" />
        Your answer
      </span>
    );
  }

  return null;
}

function QuizOptions({
  quiz,
  selectedIndex,
  showFeedback,
  onSelect,
  decode,
}: {
  quiz: QuizItem;
  selectedIndex: number | undefined;
  showFeedback: boolean;
  onSelect?: (idx: number) => void;
  decode: (input: string) => string;
}) {
  return (
    <div className="space-y-2">
      {quiz.options.map((option, idx) => {
        const selected = selectedIndex === idx;
        const correct = idx === quiz.correctAnswerIndex;
        const className = getOptionStyle(selected, correct, showFeedback);
        const content = (
          <div className="flex items-start justify-between gap-3">
            <span className="flex-1">{decode(option)}</span>
            <OptionBadge
              selected={selected}
              correct={correct}
              showFeedback={showFeedback}
            />
          </div>
        );

        if (onSelect) {
          return (
            <button
              key={`${quiz.id}-${idx}`}
              type="button"
              onClick={() => onSelect(idx)}
              className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm transition ${className}`}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={`${quiz.id}-${idx}`}
            className={`rounded-lg px-3 py-2.5 text-sm ${className}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default function StudyQuizPanel({
  quizzes,
  quizQuestionIndex,
  setQuizQuestionIndex,
  quizSelections,
  setQuizSelections,
  quizSubmitted,
  setQuizSubmitted,
  answeredCount,
  quizScore,
}: {
  quizzes: QuizItem[];
  quizQuestionIndex: number;
  setQuizQuestionIndex: (fn: (i: number) => number) => void;
  quizSelections: Record<string, number>;
  setQuizSelections: Dispatch<SetStateAction<Record<string, number>>>;
  quizSubmitted: boolean;
  setQuizSubmitted: Dispatch<SetStateAction<boolean>>;
  answeredCount: number;
  quizScore: number;
}) {
  const activeQuiz = quizzes.length > 0 ? quizzes[quizQuestionIndex] : null;
  const decode = decodeText;

  if (quizzes.length === 0) {
    // The "Create Quiz" action lives in the tab header above this panel, so the
    // empty state only shows guidance (no duplicate generate button here).
    return (
      <div className="rounded-md bg-[#f4f5fc] py-3 text-center text-sm text-[#797da0]">
        No quizzes yet. Use “Create Quiz” above to generate practice questions
        from your source.
      </div>
    );
  }

  if (quizSubmitted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#dfe4ff] bg-[#f9faff] px-3 py-2 text-xs text-[#5a5f7d]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
            Correct answer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            Your answer (incorrect)
          </span>
        </div>
        {quizzes.map((quiz, qIndex) => (
          <div key={quiz.id} className="rounded-lg border border-[#e8e9f6] p-4">
            <p className="text-sm font-semibold leading-relaxed text-[#292a40]">
              {qIndex + 1}. {decode(quiz.question)}
            </p>
            <div className="mt-3">
              <QuizOptions
                quiz={quiz}
                selectedIndex={quizSelections[quiz.id]}
                showFeedback
                decode={decode}
              />
            </div>
            <p className="mt-3 rounded-md bg-[#f4f5fc] px-3 py-2 text-xs leading-relaxed text-[#4f5373]">
              {decode(quiz.explanation)}
            </p>
          </div>
        ))}
        <div className="rounded-lg border border-[#dfe4ff] bg-[#f5f7ff] py-3 text-center">
          <p className="text-sm font-semibold text-[#5f70ff]">
            Score: {quizScore}/{quizzes.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            // Reset the attempt: clear answers so the user genuinely starts over
            // (without this, every question stays answered and "practice" is a no-op).
            setQuizSelections({});
            setQuizQuestionIndex(() => 0);
            setQuizSubmitted(false);
          }}
          className="w-full rounded-md border border-[#ced1ef] py-2 text-sm font-semibold text-[#5f70ff] transition hover:bg-[#f3f5ff]"
        >
          Practice again
        </button>
      </div>
    );
  }

  if (!activeQuiz) return null;

  const hasAnsweredCurrent = quizSelections[activeQuiz.id] !== undefined;
  const showCurrentFeedback = hasAnsweredCurrent;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#65698a]">
        <span>
          Question {quizQuestionIndex + 1} of {quizzes.length}
        </span>
        <span className="capitalize">
          {activeQuiz.difficulty || "medium"} · {activeQuiz.questionType || "recall"}
        </span>
      </div>
      <div className="rounded-lg border border-[#dfe4ff] bg-[#f9faff] p-4">
        <p className="text-base font-semibold leading-snug text-[#292a40]">
          {decode(activeQuiz.question)}
        </p>
        <div className="mt-3">
          <QuizOptions
            quiz={activeQuiz}
            selectedIndex={quizSelections[activeQuiz.id]}
            showFeedback={showCurrentFeedback}
            onSelect={(idx) =>
              setQuizSelections((prev) => ({ ...prev, [activeQuiz.id]: idx }))
            }
            decode={decode}
          />
        </div>
        {showCurrentFeedback ? (
          <p className="mt-3 rounded-md border border-[#dfe4ff] bg-white px-3 py-2 text-xs text-[#4f5373]">
            {decode(activeQuiz.explanation)}
          </p>
        ) : (
          <p className="mt-3 text-xs text-[#7a7fa8]">
            Select an answer to see whether it is correct.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={quizQuestionIndex === 0}
          onClick={() => setQuizQuestionIndex((i) => Math.max(0, i - 1))}
          className="rounded-md border border-[#ced1ef] px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setQuizSubmitted(true)}
          className="rounded-md bg-[#5f70ff] px-4 py-1.5 text-sm font-semibold text-white"
        >
          Finish quiz
        </button>
        <button
          type="button"
          disabled={quizQuestionIndex >= quizzes.length - 1}
          onClick={() => setQuizQuestionIndex((i) => Math.min(quizzes.length - 1, i + 1))}
          className="rounded-md border border-[#ced1ef] px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <p className="text-center text-xs text-[#7a7fa8]">
        Answered {answeredCount}/{quizzes.length}
      </p>
    </div>
  );
}
