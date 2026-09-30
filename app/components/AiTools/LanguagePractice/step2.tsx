"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguagePractice } from "@/app/context/LanguagePracticeContext";

type MCQOption = {
  letter: string;
  text: string;
};

type ParsedQuestion = {
  question: string;
  options: MCQOption[];
  answer?: string;
};

function parseMCQFromText(text: string): ParsedQuestion | null {
  // First try multiline format (each option on new line)
  // A) option text
  // B) option text
  let optionRegex = /^([A-D])[\)\.]\s*(.+)$/gm;
  let matches = Array.from(text.matchAll(optionRegex));

  // If not found, try inline format (options on same line: "A) option B) option")
  if (matches.length < 2) {
    // Match pattern: A) text B) text C) text D) text
    optionRegex = /\b([A-D])[\)\.]\s*([^A-D\)]+?)(?=\s+[A-D][\)\.]|\s*$)/g;
    matches = Array.from(text.matchAll(optionRegex));
  }

  if (matches.length < 2) {
    return null; // Need at least 2 options
  }

  const options: MCQOption[] = matches.map((match) => ({
    letter: match[1],
    text: match[2].trim(),
  }));

  // Extract question text (everything before the first option)
  const firstMatch = matches[0];
  const firstOptionPattern = firstMatch[0];
  const firstOptionIndex = text.indexOf(firstOptionPattern);
  let questionText = text.substring(0, firstOptionIndex).trim();

  // Clean up question text
  questionText = questionText
    .replace(/^\*\*Question \d+:\*\*\s*/i, "")
    .replace(/^\*\*Question \d+ of \d+:\*\*\s*/i, "")
    .replace(/\*\*/g, "")
    .trim();

  // Remove any trailing question marks or punctuation that might be part of the question
  questionText = questionText.replace(/\s*[?]\s*$/, "").trim();

  // Also remove the options from question text if they're still there (for inline format)
  const optionPattern = /\s*[A-D][\)\.]\s*[^A-D\)]+/g;
  questionText = questionText.replace(optionPattern, "").trim();

  // Try to find answer if present
  const answerMatch = text.match(/\*\*Answer:\*\*\s*([A-D])/i);
  const answer = answerMatch ? answerMatch[1] : undefined;

  return {
    question: questionText,
    options,
    answer,
  };
}

function cleanText(text: string): string {
  // Replace escaped newlines with actual newlines
  let cleaned = text.replace(/\\n/g, "\n");

  // Remove JSON-like patterns (e.g., ", "nextPrompt": "..." })
  cleaned = cleaned.replace(/",\s*"nextPrompt":\s*"[^"]*"\s*}/g, "");
  cleaned = cleaned.replace(/",\s*"displayMarkdown":\s*"[^"]*"\s*}/g, "");

  // Remove any trailing JSON-like content
  cleaned = cleaned.replace(/,\s*"[^"]+":\s*"[^"]*"\s*\}\s*$/g, "");

  // Clean up multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

function separateFeedbackAndQuestion(text: string): {
  feedback: string | null;
  question: string;
} {
  // Clean the text first
  text = cleanText(text);

  // Question indicators (definite start of new question) - check these FIRST
  const questionIndicators = [
    /\*\*What does ['"]/i, // **What does 'gracias' mean
    /\*\*What is ['"]/i,
    /\*\*What are ['"]/i,
    /\*\*How would you/i,
    /\*\*How do you/i,
    /\*\*Complete the/i,
    /\*\*Fill in/i,
    /\*\*Choose/i,
    /\*\*Select/i,
    /\*\*Translate/i,
    /What does ['"]/i, // What does 'gracias' mean
    /What is ['"]/i,
    /What are ['"]/i,
    /How would you/i,
    /How do you/i,
    /Complete the/i,
    /Fill in/i,
    /Choose/i,
    /Select/i,
    /Translate/i,
    /Question \d+/i,
  ];

  // Patterns that indicate feedback about previous answer
  const feedbackPatterns = [
    /^(Not quite!|Correct!|Great!|Well done!|Almost!|Good try!|Excellent!|Perfect!|Nice!|Good!)/i,
    /^(The correct answer is|The answer is|You're right|You're wrong|That's correct|That's incorrect)/i,
    /Remember,?/i,
    /So,?/i,
    /You're doing great/i,
  ];

  let feedback: string | null = null;
  let question = text;

  // FIRST: Find where the question starts (this is most reliable)
  let questionStart = text.length;
  let questionMatch: RegExpMatchArray | null = null;

  for (const indicator of questionIndicators) {
    const match = text.match(indicator);
    if (match && match.index !== undefined) {
      if (match.index < questionStart) {
        questionStart = match.index;
        questionMatch = match;
      }
    }
  }

  // If we found a question start
  if (questionStart < text.length) {
    // Everything before the question is feedback
    const beforeQuestion = text.substring(0, questionStart).trim();
    question = text.substring(questionStart).trim();

    // Check if there's actual feedback content (not just empty or whitespace)
    if (beforeQuestion.length > 0) {
      // Check if it contains feedback patterns
      let hasFeedbackContent = false;
      for (const pattern of feedbackPatterns) {
        if (pattern.test(beforeQuestion)) {
          hasFeedbackContent = true;
          break;
        }
      }

      // Also check for common feedback phrases
      const feedbackPhrases = [
        /means/i,
        /Remember/i,
        /So/i,
        /Let's/i,
        /You're doing/i,
        /No worries/i,
        /Don't worry/i,
      ];

      for (const phrase of feedbackPhrases) {
        if (phrase.test(beforeQuestion)) {
          hasFeedbackContent = true;
          break;
        }
      }

      if (hasFeedbackContent || beforeQuestion.length > 20) {
        feedback = beforeQuestion;
      }
    }

    // Clean up question - remove markdown bold if present
    question = question.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();

    if (feedback && question) {
      return { feedback: feedback.trim(), question: question.trim() };
    }
  }

  // Fallback: If no question found, check if text starts with feedback
  for (const pattern of feedbackPatterns) {
    const match = text.match(pattern);
    if (match && match.index === 0) {
      // Text starts with feedback but no question found - return all as feedback
      return { feedback: text.trim(), question: "" };
    }
  }

  // If no clear separation found, return null feedback and full text as question
  return { feedback: null, question: text };
}

function Meter({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#2b7fff] to-[#155dfc] transition-all duration-500 ease-out shadow-sm"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function Step2() {
  const { language, level, setStep, callAi, isAiBusy, history, clearArea } =
    useLanguagePractice();

  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const turns = history.assessment;
  const lastAi =
    [...turns].reverse().find((t) => t.role === "ai")?.content ?? "";

  // Check if assessment has started (has AI responses)
  const hasStarted = turns.length > 0 && turns.some((t) => t.role === "ai");

  // Check if assessment is complete
  const isComplete = useMemo(() => {
    if (!lastAi) return false;
    const lowerText = lastAi.toLowerCase();
    return (
      lowerText.includes("assessment complete") ||
      lowerText.includes("assessment is complete") ||
      (lowerText.includes("complete") && lowerText.includes("level"))
    );
  }, [lastAi]);

  // Separate feedback from current question
  const { feedback, question: currentQuestionText } = useMemo(() => {
    if (!lastAi) return { feedback: null, question: "" };
    return separateFeedbackAndQuestion(lastAi);
  }, [lastAi]);

  // Clean the current question text
  const cleanedQuestionText = useMemo(() => {
    if (!currentQuestionText) return null;
    return cleanText(currentQuestionText);
  }, [currentQuestionText]);

  // Parse MCQ from current question text
  const mcqData = useMemo(() => {
    if (!cleanedQuestionText) return null;
    return parseMCQFromText(cleanedQuestionText);
  }, [cleanedQuestionText]);

  // Check if this is a fill-in-the-blank question
  // But prioritize MCQ if options are detected
  const isFillInTheBlank = useMemo(() => {
    // If MCQ options are detected, don't treat as fill-in-the-blank
    if (mcqData && mcqData.options.length >= 2) return false;

    if (!cleanedQuestionText && !lastAi) return false;
    const textToCheck = cleanedQuestionText || cleanText(lastAi) || "";
    // Check for fill-in-the-blank indicators
    const fillBlankPatterns = [
      /___/, // Underscores indicating blank
      /fill in the blank/i,
      /filling in the blank/i,
      /fill in/i,
      /complete the/i,
      /fill the blank/i,
      /complete the sentence/i,
    ];
    return fillBlankPatterns.some((pattern) => pattern.test(textToCheck));
  }, [cleanedQuestionText, lastAi, mcqData]);

  // Determine if we should show MCQ or text input
  // Prioritize MCQ if options are detected, otherwise check for fill-in-the-blank
  const showMCQ = mcqData !== null && mcqData.options.length >= 2;
  const showTextInput =
    !showMCQ &&
    hasStarted &&
    (cleanedQuestionText !== null || isFillInTheBlank);

  // Get the question text to display - if MCQ, use the parsed question without options
  const displayQuestionText = useMemo(() => {
    if (showMCQ && mcqData) {
      return mcqData.question; // MCQ question without options
    }
    return cleanedQuestionText; // Regular question text (cleaned)
  }, [showMCQ, mcqData, cleanedQuestionText]);

  const kickoffHint = useMemo(() => {
    return [
      "Create a short placement assessment (10–12 items) mixing MCQ + short answers.",
      "For MCQ: Format as 'Question text' followed by lines like 'A) option', 'B) option', etc.",
      "Ask ONE question at a time. Keep it friendly and encouraging.",
      "After each user answer: give quick feedback + ask the next question.",
      "When enough info: set levelUpdate (CEFR) and say 'Assessment complete'.",
      "Also include progressDelta.consistency +2 occasionally to reward effort.",
      "If the user hasn't selected a language, ask them to go back to Step 1.",
    ].join("\n");
  }, []);

  const start = async () => {
    if (!language) {
      await callAi({
        area: "assessment",
        userInput: "Start my assessment.",
        hint: kickoffHint,
      });
      return;
    }
    setStarted(true);
    clearArea("assessment");
    setAnswer("");
    setSelectedOption(null);
    await callAi({
      area: "assessment",
      userInput:
        "Start a placement assessment. Ask question 1 now. Keep it short.",
      hint: kickoffHint,
    });
  };

  const submit = async () => {
    if (showMCQ && selectedOption) {
      const input = selectedOption;
      setSelectedOption(null);
      await callAi({
        area: "assessment",
        userInput: input,
        hint: "Continue the assessment. If ready, set levelUpdate and say 'Assessment complete'.",
      });
    } else if (showTextInput && answer.trim()) {
      const input = answer.trim();
      setAnswer("");
      await callAi({
        area: "assessment",
        userInput: input,
        hint: "Continue the assessment. If ready, set levelUpdate and say 'Assessment complete'.",
      });
    }
  };

  const readiness = useMemo(() => {
    const userTurns = turns.filter((t) => t.role === "user").length;
    return Math.min(100, userTurns * 12);
  }, [turns]);

  return (
    <div className="space-y-6">
      {/* Modern header card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6 shadow-lg shadow-blue-100/50">
        <div className="relative z-10">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#155dfc] text-white shadow-md">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-lg font-bold tracking-tight text-gray-900">
                  Quick Placement Check
                </div>
              </div>
              <div className="text-sm text-gray-600">
                I&apos;ll use this to set your starting difficulty — no pressure.
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
              {language ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Language:</span>
                  <span className="font-bold text-gray-900">{language}</span>
                </div>
              ) : (
                <span className="text-gray-500">
                  Choose a language in Step 1 first
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Assessment Progress</span>
              <span className="tabular-nums text-gray-900">{readiness}%</span>
            </div>
            <Meter value={readiness} />
          </div>
        </div>
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      {/* Level display card - Only show when assessment hasn't started OR when assessment is complete */}
      {(!hasStarted || isComplete) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Your Estimated Level
              </div>
              <div className="mt-1.5 text-sm text-gray-600">
                {level ? (
                  <>
                    You&apos;re currently around{" "}
                    <span className="font-bold text-[#155dfc]">{level}</span>.
                  </>
                ) : (
                  "We'll set this after a few questions."
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={start}
              disabled={isAiBusy}
              className={[
                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200",
                isAiBusy
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
              ].join(" ")}
            >
              {isAiBusy ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  {isComplete ? "Restart Assessment" : "Start Assessment"}
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tutor interaction card - Only show when assessment has started */}
      {hasStarted && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#155dfc]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="text-base font-bold text-gray-900">Tutor</div>
          </div>

          {/* Feedback/Notice Box - Only show if there's feedback about previous answer */}
          {feedback && (
            <div className="mb-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#155dfc] text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1447e6]">
                    Feedback
                  </div>
                  <div className="text-sm text-gray-800">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1 leading-relaxed last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-gray-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-700">{children}</em>
                        ),
                      }}
                    >
                      {feedback}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Question Box */}
          {displayQuestionText && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 text-sm text-gray-800 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Current Question
              </div>
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 leading-relaxed font-medium">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-700">{children}</em>
                    ),
                    h1: ({ children }) => (
                      <h1 className="mb-3 text-xl font-bold text-gray-900">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-2 text-lg font-bold text-gray-900">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 text-base font-bold text-gray-900">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-2 ml-4 list-disc space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-2 ml-4 list-decimal space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="my-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-2 border-l-4 border-blue-300 pl-4 italic text-gray-700">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {displayQuestionText}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Fallback if no question text yet */}
          {!displayQuestionText && !feedback && (
            <div className="mb-4 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 text-sm text-gray-500 shadow-sm">
              Tap &quot;Start Assessment&quot; and I&apos;ll ask the first question.
            </div>
          )}

          {/* MCQ Options - Only show if assessment is not complete */}
          {!isComplete && showMCQ && mcqData && (
            <div className="mb-4 space-y-2">
              <div className="text-xs font-semibold text-gray-600">
                Select your answer:
              </div>
              {mcqData.options.map((option) => (
                <button
                  key={option.letter}
                  type="button"
                  onClick={() => setSelectedOption(option.letter)}
                  disabled={isAiBusy}
                  className={[
                    "w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
                    selectedOption === option.letter
                      ? "border-[#2b7fff] bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                    isAiBusy
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                        selectedOption === option.letter
                          ? "bg-[#155dfc] text-white"
                          : "bg-gray-100 text-gray-600",
                      ].join(" ")}
                    >
                      {option.letter}
                    </div>
                    <div className="flex-1 text-sm font-medium text-gray-900">
                      {option.text}
                    </div>
                    {selectedOption === option.letter && (
                      <svg
                        className="h-5 w-5 text-[#155dfc]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Text Input (when not MCQ) - Only show if assessment is not complete */}
          {!isComplete && showTextInput && (
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                disabled={isAiBusy}
                placeholder="Type your answer…"
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#2b7fff] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <button
                type="button"
                onClick={submit}
                disabled={isAiBusy || !answer.trim()}
                className={[
                  "group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200",
                  isAiBusy || !answer.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#155dfc] to-[#1447e6] hover:from-[#1447e6] hover:to-[#193cb8] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                ].join(" ")}
              >
                {isAiBusy ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Submit button for MCQ - Only show if assessment is not complete */}
          {!isComplete && showMCQ && (
            <button
              type="button"
              onClick={submit}
              disabled={isAiBusy || !selectedOption}
              className={[
                "group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200",
                isAiBusy || !selectedOption
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#155dfc] to-[#1447e6] hover:from-[#1447e6] hover:to-[#193cb8] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
              ].join(" ")}
            >
              {isAiBusy ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          )}

          {/* Tip - Only show if assessment is not complete */}
          {!isComplete && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-[#155dfc]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs text-gray-700">
                <span className="font-semibold">Tip:</span> If you&apos;re unsure,
                take a guess — guessing is data! 📊
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!isComplete}
          className={[
            "rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all",
            isComplete
              ? "bg-gradient-to-r from-[#155dfc] to-[#1447e6] hover:from-[#1447e6] hover:to-[#193cb8] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed",
          ].join(" ")}
        >
          Continue to Goals
        </button>
      </div>
    </div>
  );
}
