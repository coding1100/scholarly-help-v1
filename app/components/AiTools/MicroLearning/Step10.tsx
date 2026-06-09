"use client";

import {
  ParsedQuestion,
  parseQuizFromResponse,
  sendMicroLearningMessage,
} from "@/app/utilities/api";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface Step10Props {
  conversationId: string;
  onComplete: (results: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectQuestionNumbers: number[];
  }) => void;
  onBack?: () => void;
}

export default function Step10({
  conversationId,
  onComplete,
  onBack,
}: Step10Props) {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(
    new Map(),
  );
  const [quizResults, setQuizResults] = useState<{
    correct: number[];
    incorrect: number[];
  }>({ correct: [], incorrect: [] });

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const message = `Create a quick 2-3 question multiple-choice micro-quiz to test understanding of the previous lesson.

Formatting rules (follow exactly):
- Each question must be formatted like:
  **Question 1:**
  <question text>
  A) <option>
  B) <option>
  C) <option>
  D) <option>
  **Answer:** <A-D>
- Repeat for Question 2, Question 3 (if included)

Difficulty: medium`;

        const response = await sendMicroLearningMessage(message, conversationId);
        const parsedQuestions = parseQuizFromResponse(response.message);

        if (parsedQuestions.length === 0) {
          throw new Error(
            "No questions found in the response. Please try again.",
          );
        }

        setQuestions(parsedQuestions);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load quiz. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [conversationId]);

  const handleOptionClick = (optionLetter: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(optionLetter);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionLetter === currentQuestion.answer;

    // Store user's answer
    const updatedAnswers = new Map(userAnswers);
    updatedAnswers.set(currentQuestion.number, optionLetter);
    setUserAnswers(updatedAnswers);

    // Calculate updated results
    const updatedResults = {
      correct: [...quizResults.correct],
      incorrect: [...quizResults.incorrect],
    };

    // Remove current question from both arrays if it was there
    updatedResults.correct = updatedResults.correct.filter(
      (n) => n !== currentQuestion.number,
    );
    updatedResults.incorrect = updatedResults.incorrect.filter(
      (n) => n !== currentQuestion.number,
    );

    // Add to appropriate array
    if (isCorrect) {
      updatedResults.correct.push(currentQuestion.number);
    } else {
      updatedResults.incorrect.push(currentQuestion.number);
    }

    // Update results state
    setQuizResults(updatedResults);

    // Move to next question after a short delay
    setTimeout(() => {
      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (!isLastQuestion) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        // Quiz complete - calculate final results
        const finalResults = {
          totalQuestions: questions.length,
          correctAnswers: updatedResults.correct.length,
          incorrectQuestionNumbers: updatedResults.incorrect,
        };
        onComplete(finalResults);
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="relative h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        <ToolsApiLoader show />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        <div className="max-w-md w-full bg-[#F0F0F0] rounded-3xl p-8 text-center">
          <div className="text-[#fb2c36] text-4xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-[#333333] mb-2">
            Something went wrong
          </h3>
          <p className="text-[#666666] mb-6">{error}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-[#6C757D] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        <div className="max-w-md w-full bg-[#F0F0F0] rounded-3xl p-8 text-center">
          <p className="text-[#666666] mb-6">No questions available.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-[#6C757D] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  return (
    <div className="h-[calc(100vh-8vh)] overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-3xl">
        {/* Quiz Card */}
        <div className="bg-[#F0F0F0] rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="sm:flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-[#333333]">
                Quick Check
              </p>
              <span className="text-2xl">🧪</span>
            </div>
            <div className="text-[#666666] font-semibold text-lg">
              Question {currentQuestion.number} of {totalQuestions}
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-[#333333] mb-4 leading-relaxed text-lg">
                      {children}
                    </p>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-[#E0E0E0] px-2 py-1 rounded text-[#333333] font-mono text-sm">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-[#E0E0E0] p-4 rounded-lg overflow-x-auto mb-4">
                        <code className="text-[#333333] font-mono text-sm">
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-[#E0E0E0] p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {currentQuestion.question}
              </ReactMarkdown>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.letter;
              const isCorrect = option.letter === currentQuestion.answer;
              const showFeedback = selectedAnswer !== null;

              let optionClass =
                "bg-white border-2 border-[#D7D7D7] text-[#333333]";

              if (showFeedback) {
                if (isCorrect) {
                  optionClass =
                    "bg-green-100 border-2 border-[#00c951] text-[#333333]";
                } else if (isSelected && !isCorrect) {
                  optionClass =
                    "bg-red-100 border-2 border-[#fb2c36] text-[#333333]";
                }
              } else {
                optionClass +=
                  " hover:border-[#6C757D] hover:shadow-md cursor-pointer transition-all duration-200";
              }

              return (
                <button
                  key={option.letter}
                  onClick={() => handleOptionClick(option.letter)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl ${optionClass} flex items-center gap-4 text-left`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-base ${
                      showFeedback && isCorrect
                        ? "bg-[#00c951] text-white"
                        : showFeedback && isSelected && !isCorrect
                          ? "bg-[#fb2c36] text-white"
                          : "bg-[#5A5A5A] text-white"
                    }`}
                  >
                    {option.letter}
                  </div>
                  <span className="flex-1 text-[#333333] font-medium">
                    {option.text}
                  </span>
                  {showFeedback && isCorrect && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <span className="text-red-600 text-xl">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
