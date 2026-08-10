"use client";

import { ParsedQuestion } from "@/app/utilities/api";
import { useState, useMemo } from "react";

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectQuestionNumbers: number[];
}

interface Step7Props {
  topic: string;
  difficulty: string;
  questions: ParsedQuestion[];
  onComplete?: (result: QuizResult) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string; // For multiple choice (A, B, C, D)
  correctAnswerText?: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

interface AttemptResult {
  attempts: number;
  firstAttemptCorrect: boolean;
  completedCorrectly: boolean;
}

type AnswerType = "multiple-choice" | "type-answer";

export default function Step7({
  topic,
  difficulty,
  questions: parsedQuestions,
  onComplete,
}: Step7Props) {
  // Convert ParsedQuestion[] to Question[] format
  const questions: Question[] = useMemo(() => {
    return parsedQuestions.map((pq) => ({
      id: pq.number,
      question: pq.question,
      options: pq.options.map((opt) => opt.text),
      correctAnswer: pq.answer,
      correctAnswerText: pq.options.find((opt) => opt.letter === pq.answer)?.text,
      feedback: {
        correct: "Your answer is correct! Great job!",
        incorrect: `The correct answer is ${pq.answer}) ${
          pq.options.find((opt) => opt.letter === pq.answer)?.text
        }.`,
      },
    }));
  }, [parsedQuestions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerType, setAnswerType] = useState<AnswerType>("multiple-choice");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptResults, setAttemptResults] = useState<Record<number, AttemptResult>>({});

  // Safety check: if no questions, show error
  if (questions.length === 0) {
    return (
      <div className="h-[calc(100vh-9vh)] overflow-y-auto flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="w-full max-w-2xl relative">
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-xl font-semibold text-black mb-3">No Questions Available</h2>
            <p className="text-gray-600 text-sm">
              Quiz questions could not be loaded. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const recordAttempt = (correct: boolean) => {
    const questionNumber = currentQuestionIndex + 1;

    setAttemptResults((prev) => {
      const existing = prev[questionNumber];
      return {
        ...prev,
        [questionNumber]: existing
          ? {
              ...existing,
              attempts: existing.attempts + 1,
              completedCorrectly: existing.completedCorrectly || correct,
            }
          : {
              attempts: 1,
              firstAttemptCorrect: correct,
              completedCorrectly: correct,
            },
      };
    });

    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleAnswerTypeChange = (type: AnswerType) => {
    if (!isSubmitted) {
      setAnswerType(type);
      setSelectedOption(null);
      setTypedAnswer("");
    }
  };

  const handleOptionSelect = (optionLetter: string) => {
    if (!isSubmitted) {
      setSelectedOption(optionLetter);
      const isAnswerCorrect = optionLetter === currentQuestion.correctAnswer;
      recordAttempt(isAnswerCorrect);
    }
  };

  const handleSubmitTyped = () => {
    if (typedAnswer.trim() && !isSubmitted) {
      const normalizedTyped = typedAnswer.trim().toLowerCase();
      const normalizedCorrect = currentQuestion.correctAnswerText?.toLowerCase().trim() || "";
      const isAnswerCorrect =
        normalizedTyped === normalizedCorrect ||
        (normalizedCorrect && normalizedTyped.includes(normalizedCorrect)) ||
        (normalizedCorrect && normalizedCorrect.includes(normalizedTyped));

      recordAttempt(!!isAnswerCorrect);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitted && typedAnswer.trim()) {
      e.preventDefault();
      handleSubmitTyped();
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setTypedAnswer("");
    // First-attempt result is explicitly preserved in attemptResults
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsSubmitted(false);
      setIsCorrect(false);
      setSelectedOption(null);
      setTypedAnswer("");
      setAnswerType("multiple-choice");
    } else {
      // Quiz complete - calculate final results based on first-attempt accuracy
      const firstAttemptCorrectCount = Object.values(attemptResults).filter(
        (res) => res.firstAttemptCorrect
      ).length;
      const incorrectQuestions = Object.entries(attemptResults)
        .filter(([_, res]) => !res.firstAttemptCorrect)
        .map(([qNum]) => parseInt(qNum, 10));

      onComplete?.({
        totalQuestions,
        correctAnswers: firstAttemptCorrectCount,
        incorrectQuestionNumbers: incorrectQuestions,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-9vh)] overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6 sm:flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black text-center mb-3 leading-tight">
          {topic} - {difficulty}
        </h2>
        <p className="text-lg text-center mb-3 leading-tight text-gray-600 font-mono">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-5xl mx-auto relative">
        <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-2xl">
          {/* Answer Type Selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl bg-gray-200/60 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleAnswerTypeChange("multiple-choice")}
                disabled={isSubmitted}
                aria-pressed={answerType === "multiple-choice"}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  answerType === "multiple-choice"
                    ? "bg-white text-[#5f70ff] shadow-md"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => handleAnswerTypeChange("type-answer")}
                disabled={isSubmitted}
                aria-pressed={answerType === "type-answer"}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  answerType === "type-answer"
                    ? "bg-white text-[#5f70ff] shadow-md"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Type Answer
              </button>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-semibold text-black mb-6 text-center">
            {currentQuestion.question}
          </h3>

          {/* Options / Input */}
          {answerType === "multiple-choice" ? (
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((optionText, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === letter;
                const isAnswerCorrect = letter === currentQuestion.correctAnswer;

                let optionStyle = "bg-white/60 border-gray-200 hover:border-[#5f70ff]";
                if (isSubmitted) {
                  if (isSelected && isCorrect) {
                    optionStyle = "bg-emerald-100 border-emerald-500 text-emerald-900";
                  } else if (isSelected && !isCorrect) {
                    optionStyle = "bg-rose-100 border-rose-500 text-rose-900";
                  } else if (isAnswerCorrect) {
                    optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-800";
                  }
                } else if (isSelected) {
                  optionStyle = "bg-[#5f70ff]/10 border-[#5f70ff] text-[#5f70ff]";
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleOptionSelect(letter)}
                    disabled={isSubmitted}
                    aria-pressed={isSelected}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${optionStyle} disabled:cursor-default`}
                  >
                    <span className="font-bold mr-2">{letter})</span>
                    <span>{optionText}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-6">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitted}
                placeholder="Type your answer here and press Enter..."
                className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white/80 outline-none focus:border-[#5f70ff] focus:ring-2 focus:ring-[#5f70ff]/20 transition-all text-black"
              />
              {!isSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitTyped}
                  disabled={!typedAnswer.trim()}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-[#5f70ff] text-white font-semibold text-sm shadow-md hover:bg-[#4a5be6] disabled:opacity-40 disabled:shadow-none"
                >
                  Submit Answer
                </button>
              )}
            </div>
          )}

          {/* Feedback & Actions */}
          {isSubmitted && (
            <div className="mt-6 border-t border-gray-200/60 pt-6">
              <div
                className={`p-4 rounded-2xl mb-6 ${
                  isCorrect
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                <p className="font-semibold mb-1">{isCorrect ? "Correct! 🎉" : "Incorrect 💡"}</p>
                <p className="text-sm">
                  {isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                {!isCorrect && (
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 shadow-sm"
                  >
                    Try Again
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#5f70ff] text-white font-semibold text-sm hover:bg-[#4a5be6] shadow-md"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? "Next Question ›" : "Complete Quiz 🎉"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
