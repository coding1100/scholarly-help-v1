"use client";

import { Dispatch, SetStateAction } from "react";

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
  isLoading,
  onGenerate,
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
  isLoading: boolean;
  onGenerate: () => void;
}) {
  const activeQuiz = quizzes.length > 0 ? quizzes[quizQuestionIndex] : null;
  const decode = decodeText;

  if (quizzes.length === 0) {
    return (
      <div className="rounded-md bg-[#f4f5fc] py-3 text-center text-sm text-[#797da0]">
        No quizzes yet. Generate practice questions from your source.
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="mx-auto mt-3 block rounded-md bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Generate quiz"}
        </button>
      </div>
    );
  }

  if (quizSubmitted) {
    return (
      <div className="max-h-[60vh] space-y-3 overflow-y-auto">
        {quizzes.map((quiz, qIndex) => (
          <div key={quiz.id} className="rounded-md border border-[#e8e9f6] p-3">
            <p className="text-sm font-semibold text-[#292a40]">
              {qIndex + 1}. {decode(quiz.question)}
            </p>
            <div className="mt-2 space-y-1">
              {quiz.options.map((option, idx) => {
                const selected = quizSelections[quiz.id] === idx;
                const correct = idx === quiz.correctAnswerIndex;
                return (
                  <div
                    key={`${quiz.id}-${idx}`}
                    className={`rounded-md px-2 py-2 text-sm ${
                      correct
                        ? "bg-emerald-100 text-emerald-800"
                        : selected
                          ? "bg-red-100 text-red-700"
                          : "bg-[#f7f8ff] text-[#4f5373]"
                    }`}
                  >
                    {decode(option)}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-[#696d8d]">{decode(quiz.explanation)}</p>
          </div>
        ))}
        <p className="text-center text-sm font-semibold text-[#5f70ff]">
          Score: {quizScore}/{quizzes.length}
        </p>
        <button
          type="button"
          onClick={() => {
            setQuizSubmitted(false);
            setQuizQuestionIndex(() => 0);
          }}
          className="w-full rounded-md border border-[#ced1ef] py-2 text-sm font-semibold text-[#5f70ff]"
        >
          Practice again
        </button>
      </div>
    );
  }

  if (!activeQuiz) return null;

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
        <div className="mt-3 space-y-2">
          {activeQuiz.options.map((option, idx) => {
            const selected = quizSelections[activeQuiz.id] === idx;
            return (
              <button
                key={`${activeQuiz.id}-${idx}`}
                type="button"
                onClick={() =>
                  setQuizSelections((prev) => ({ ...prev, [activeQuiz.id]: idx }))
                }
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "border border-[#5f70ff] bg-[#e8ebff] text-[#3441b5]"
                    : "border border-[#e8e9f6] bg-white text-[#4f5373] hover:border-[#c9d1ff]"
                }`}
              >
                {decode(option)}
              </button>
            );
          })}
        </div>
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
