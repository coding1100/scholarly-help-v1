"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HiClock, HiDocumentText } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface Step3Props {
  examType: string;
  subject: string;
  apiResponse: {
    conversation_id: string;
    message: string;
    agent_id: string;
  };
  onComplete?: (results: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    answers: Map<number, string>;
  }) => void;
}

interface ParsedQuestion {
  number: number;
  instruction?: string;
  passage?: string;
  question: string;
  options: Array<{
    letter: string;
    text: string;
  }>;
  answer: string; // For validation later, not shown to user
}

function parseQuestions(markdown: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // Split by question markers
  const questionRegex = /\*\*Question (\d+):\*\*/g;
  const questionMatches = Array.from(markdown.matchAll(questionRegex));

  questionMatches.forEach((match, idx) => {
    const questionNumber = parseInt(match[1]);
    const startIndex = match.index! + match[0].length;
    const endIndex =
      idx < questionMatches.length - 1
        ? questionMatches[idx + 1].index!
        : markdown.length;

    const questionBlock = markdown.substring(startIndex, endIndex).trim();

    // Extract instruction (italic text at the start)
    const instructionMatch = questionBlock.match(/^\*([^*]+)\*/);
    const instruction = instructionMatch
      ? instructionMatch[1].trim()
      : undefined;

    // Extract passage (text in quotes)
    const passageMatch = questionBlock.match(/"([^"]+)"/);
    const passage = passageMatch ? passageMatch[1].trim() : undefined;

    // Find where options start
    const optionStartIndex = questionBlock.search(/^[A-D]\)/m);
    if (optionStartIndex === -1) return;

    // Extract question text (between instruction/passage and options)
    let questionText = questionBlock.substring(0, optionStartIndex).trim();
    // Remove instruction and passage from question text if present
    if (instruction) {
      questionText = questionText.replace(/^\*[^*]+\*\s*/, "").trim();
    }
    if (passage) {
      questionText = questionText.replace(/"[^"]+"\s*/, "").trim();
    }
    // Clean up any remaining markdown and extra whitespace
    questionText = questionText
      .replace(/\*\*/g, "")
      .replace(/\n+/g, " ")
      .trim();

    // Extract options
    const options: ParsedQuestion["options"] = [];
    const answerStartIndex = questionBlock.search(/\*\*Answer:\*\*/i);
    const optionsSection =
      answerStartIndex > -1
        ? questionBlock.substring(0, answerStartIndex)
        : questionBlock;

    const optionRegex = /^([A-D])\)\s*(.+)$/gm;
    let optionMatch;
    while ((optionMatch = optionRegex.exec(optionsSection)) !== null) {
      options.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim(),
      });
    }

    // Extract answer (for validation, not displayed)
    const answerMatch = questionBlock.match(/\*\*Answer:\*\*\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1] : "";

    if (questionText && options.length >= 2) {
      questions.push({
        number: questionNumber,
        instruction,
        passage,
        question: questionText,
        options,
        answer,
      });
    }
  });

  return questions;
}

export default function Step3({
  examType,
  subject,
  apiResponse,
  onComplete,
}: Step3Props) {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(
    new Map(),
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeLimit, setTimeLimit] = useState(0); // Total time limit in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse questions on mount and calculate time limit
  useEffect(() => {
    const parsed = parseQuestions(apiResponse.message);
    setQuestions(parsed);
    // Calculate time: 30 seconds per question
    const calculatedTime = parsed.length * 30;
    setTimeLimit(calculatedTime);
    setTimeRemaining(calculatedTime);
  }, [apiResponse.message]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionNumber: number, optionLetter: string) => {
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(questionNumber, optionLetter);
      return newMap;
    });
  };

  const handleSubmit = useCallback(() => {
    // Close modal if open
    setShowTimeUpModal(false);

    // Calculate results
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = selectedAnswers.get(q.number);
      if (userAnswer === q.answer) {
        correctCount++;
      }
    });

    const score =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100 * 10) / 10
        : 0;

    if (onComplete) {
      onComplete({
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score,
        answers: selectedAnswers,
      });
    }
  }, [questions, selectedAnswers, onComplete]);

  // Timer countdown - only start when we have questions and time is set
  useEffect(() => {
    if (timeRemaining > 0 && !isTimeUp && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true);
            setShowTimeUpModal(true);
            // Auto-submit after 2 seconds
            setTimeout(() => {
              handleSubmit();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, isTimeUp, handleSubmit, questions.length]);

  const totalQuestions = questions.length;

  return (
    <div className="flex justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-4xl my-8">
        {/* Header */}
        <div className="backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl">
          <div className="sm:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HiDocumentText className="text-4xl text-[#51a2ff]" />
              <div>
                <p className="text-2xl font-semibold text-black">
                  Practice Exam
                </p>
                <p className="text-lg font-semibold text-black">
                  {examType} - {subject}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {totalQuestions} questions • {formatTime(timeLimit)}
                </p>
              </div>
            </div>
            <div className="sm:ml-0 ml-auto sm:mt-0 w-full sm:w-fit mt-2 flex items-center gap-2 text-black">
              <HiClock className="text-2xl" />
              <span className="text-2xl font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.number}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-black mb-4">
                Question {q.number}
              </h3>

              {q.instruction && (
                <p className="text-gray-500 italic mb-3">{q.instruction}</p>
              )}

              {q.passage && (
                <div className="bg-gray-500 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-black leading-relaxed">"{q.passage}"</p>
                </div>
              )}

              <div className="mb-4">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-black mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-black">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {q.question}
                </ReactMarkdown>
              </div>

              <div className="space-y-1">
                {q.options.map((option) => {
                  const isSelected =
                    selectedAnswers.get(q.number) === option.letter;
                  return (
                    <label
                      key={option.letter}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#155dfc]/30 border-2 border-[#2b7fff]"
                          : "bg-white/10 border-2 border-white/20 hover:bg-white/15"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.number}`}
                        value={option.letter}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerChange(q.number, option.letter)
                        }
                        className="mt-1 w-4 h-4 text-[#155dfc] focus:ring-[#2b7fff] focus:ring-2"
                        disabled={isTimeUp}
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-black mr-2">
                          {option.letter})
                        </span>
                        <span className="text-gray-500">{option.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isTimeUp}
            className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#155dfc] to-[#1447e6] text-white font-bold text-base shadow-lg hover:shadow-xl hover:from-[#1447e6] hover:to-[#193cb8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Exam
          </button>
        </div>

        {/* Time Up Modal */}
        {showTimeUpModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md mx-4 backdrop-blur-xl">
              <div className="text-center">
                <HiClock className="text-5xl text-[#51a2ff] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-black mb-3">
                  Time's Up!
                </h2>
                <p className="text-gray-500 mb-6">
                  Your exam time has ended. Your answers will be submitted
                  automatically.
                </p>
                <div className="relative flex min-h-[80px] items-center justify-center">
                  <ToolsApiLoader show contained respectToolsSidebar={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
