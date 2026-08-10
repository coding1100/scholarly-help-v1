"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { FiCheck, FiHelpCircle, FiSkipForward, FiX } from "react-icons/fi";
import { TutorQuizResultItem } from "@/app/components/AiTools/Tutor/tutorExperience";

type QuizItem = {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: string;
  questionType?: string;
  questionFormat?: string;
  answer?: string;
  hint?: string;
  simpleExplanation?: string;
  topic?: string;
};

type QuizAnswer = number | string;

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function isQuizAnswerCorrect(quiz: QuizItem, answer: QuizAnswer | undefined) {
  if (quiz.questionFormat !== "short_answer") {
    return answer === quiz.correctAnswerIndex;
  }
  const received = normalizeAnswer(String(answer || ""));
  const expected = normalizeAnswer(quiz.answer || "");
  if (!received || !expected) return false;
  if (received === expected || received.includes(expected) || expected.includes(received)) return true;
  const expectedTokens = new Set(expected.split(" ").filter((token) => token.length > 3));
  const receivedTokens = new Set(received.split(" "));
  const overlap = [...expectedTokens].filter((token) => receivedTokens.has(token)).length;
  return overlap / Math.max(1, expectedTokens.size) >= 0.65;
}

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
  selectedIndex: QuizAnswer | undefined;
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
  onComplete,
}: {
  quizzes: QuizItem[];
  quizQuestionIndex: number;
  setQuizQuestionIndex: (fn: (i: number) => number) => void;
  quizSelections: Record<string, QuizAnswer>;
  setQuizSelections: Dispatch<SetStateAction<Record<string, QuizAnswer>>>;
  quizSubmitted: boolean;
  setQuizSubmitted: Dispatch<SetStateAction<boolean>>;
  answeredCount: number;
  quizScore: number;
  onComplete?: (results: TutorQuizResultItem[]) => void;
}) {
  const [skippedIds, setSkippedIds] = useState<Record<string, boolean>>({});
  const [hintedIds, setHintedIds] = useState<Record<string, boolean>>({});
  const [explanationMode, setExplanationMode] = useState<"standard" | "simple">("standard");
  const completionRecordedRef = useRef(false);
  const activeQuiz = quizzes.length > 0 ? quizzes[quizQuestionIndex] : null;
  const decode = decodeText;
  const correctCount = quizzes.filter(
    (quiz) => !skippedIds[quiz.id] && isQuizAnswerCorrect(quiz, quizSelections[quiz.id]),
  ).length;
  const scoredCount = quizzes.filter((quiz) => !skippedIds[quiz.id]).length;

  const finishQuiz = () => {
    setQuizSubmitted(true);
    if (completionRecordedRef.current) return;
    completionRecordedRef.current = true;
    onComplete?.(
      quizzes.map((quiz) => ({
        topic: quiz.topic || "General",
        correct: !skippedIds[quiz.id] && isQuizAnswerCorrect(quiz, quizSelections[quiz.id]),
        skipped: Boolean(skippedIds[quiz.id]),
        usedHint: Boolean(hintedIds[quiz.id]),
      })),
    );
  };

  const skipCurrent = () => {
    if (!activeQuiz) return;
    setSkippedIds((current) => ({ ...current, [activeQuiz.id]: true }));
    if (quizQuestionIndex >= quizzes.length - 1) {
      const nextSkipped = { ...skippedIds, [activeQuiz.id]: true };
      setQuizSubmitted(true);
      if (!completionRecordedRef.current) {
        completionRecordedRef.current = true;
        onComplete?.(
          quizzes.map((quiz) => ({
            topic: quiz.topic || "General",
            correct:
              !nextSkipped[quiz.id] && isQuizAnswerCorrect(quiz, quizSelections[quiz.id]),
            skipped: Boolean(nextSkipped[quiz.id]),
            usedHint: Boolean(hintedIds[quiz.id]),
          })),
        );
      }
      return;
    }
    setQuizQuestionIndex((index) => Math.min(quizzes.length - 1, index + 1));
  };

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
              {quiz.questionFormat === "short_answer" ? (
                <div className="space-y-2 text-sm">
                  <p className="rounded-md bg-[#f4f5fc] px-3 py-2 text-[#4f5373]">
                    <b>Your answer:</b> {String(quizSelections[quiz.id] || "No answer")}
                  </p>
                  <p className="rounded-md bg-[#ecfdf5] px-3 py-2 text-[#176046]">
                    <b>Model answer:</b> {decode(quiz.answer || "See explanation below")}
                  </p>
                </div>
              ) : (
                <QuizOptions
                  quiz={quiz}
                  selectedIndex={quizSelections[quiz.id]}
                  showFeedback
                  decode={decode}
                />
              )}
            </div>
            {skippedIds[quiz.id] ? (
              <p className="mt-2 text-xs font-semibold text-[#a66b13]">Skipped · flagged to revisit</p>
            ) : null}
            <p className="mt-3 rounded-md bg-[#f4f5fc] px-3 py-2 text-xs leading-relaxed text-[#4f5373]">
              {decode(quiz.explanation)}
            </p>
          </div>
        ))}
        <div className="rounded-lg border border-[#dfe4ff] bg-[#f5f7ff] py-3 text-center">
          <p className="text-sm font-semibold text-[#5f70ff]">
            Score: {correctCount}/{Math.max(1, scoredCount)} · {quizzes.length - scoredCount} skipped without penalty
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
            setSkippedIds({});
            setHintedIds({});
            setExplanationMode("standard");
            completionRecordedRef.current = false;
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
          {activeQuiz.questionFormat === "short_answer" ? (
            <textarea
              value={String(quizSelections[activeQuiz.id] || "")}
              onChange={(event) =>
                setQuizSelections((prev) => ({
                  ...prev,
                  [activeQuiz.id]: event.target.value,
                }))
              }
              rows={3}
              placeholder="Type your answer"
              className="w-full resize-none rounded-lg border border-[#dfe4ff] bg-white px-3 py-2.5 text-sm text-[#34384f] outline-none focus:border-[#7480e8]"
            />
          ) : (
            <QuizOptions
              quiz={activeQuiz}
              selectedIndex={quizSelections[activeQuiz.id]}
              showFeedback={showCurrentFeedback}
              onSelect={(idx) =>
                setQuizSelections((prev) => ({ ...prev, [activeQuiz.id]: idx }))
              }
              decode={decode}
            />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHintedIds((current) => ({ ...current, [activeQuiz.id]: true }))}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d28b] bg-[#fff9e9] px-3 py-1.5 text-xs font-semibold text-[#9b6b00]"
          >
            <FiHelpCircle className="h-3.5 w-3.5" /> Need a hint
          </button>
          <button
            type="button"
            onClick={skipCurrent}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe3f4] bg-white px-3 py-1.5 text-xs font-semibold text-[#666b89]"
          >
            <FiSkipForward className="h-3.5 w-3.5" /> Skip without penalty
          </button>
        </div>
        {hintedIds[activeQuiz.id] ? (
          <p className="mt-3 rounded-md border border-[#f3dfa8] bg-[#fffbef] px-3 py-2 text-xs leading-relaxed text-[#755b1e]">
            {decode(activeQuiz.hint || "Look for the core idea in the question and rule out answers that contradict the source.")}
          </p>
        ) : null}
        {showCurrentFeedback ? (
          <p className="mt-3 rounded-md border border-[#dfe4ff] bg-white px-3 py-2 text-xs text-[#4f5373]">
            {decode(
              explanationMode === "simple"
                ? activeQuiz.simpleExplanation || activeQuiz.explanation
                : activeQuiz.explanation,
            )}
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
          onClick={finishQuiz}
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
      {hasAnsweredCurrent ? (
        <button
          type="button"
          onClick={() => setExplanationMode((mode) => (mode === "simple" ? "standard" : "simple"))}
          className="text-xs font-semibold text-[#5262df] underline decoration-[#cbd2ff] underline-offset-2"
        >
          {explanationMode === "simple" ? "Show full explanation" : "Explain like I’m 6"}
        </button>
      ) : null}
      <p className="text-center text-xs text-[#7a7fa8]">
        Answered {answeredCount}/{quizzes.length}
      </p>
    </div>
  );
}
