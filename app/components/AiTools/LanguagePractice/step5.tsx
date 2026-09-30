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
  // Look for patterns like:
  // A) option text
  // B) option text
  // Or: A) option B) option (on same line)
  // Or: "Choose 'X' or 'Y'" format
  // Support both multiline and inline formats

  // First try multiline format (each option on new line)
  let optionRegex = /^([A-D])[\)\.]\s*(.+)$/gm;
  let matches = Array.from(text.matchAll(optionRegex));

  // If not found, try inline format (options on same line: "A) option B) option")
  if (matches.length < 2) {
    // Match pattern: A) text B) text C) text D) text
    optionRegex = /\b([A-D])[\)\.]\s*([^A-D\)]+?)(?=\s+[A-D][\)\.]|\s*$)/g;
    matches = Array.from(text.matchAll(optionRegex));
  }

  // If still not found, try "Choose 'X' or 'Y'" format
  if (matches.length < 2) {
    // Pattern: Choose 'option1' or 'option2' / Choose option1 or option2
    const choosePattern =
      /(?:Choose|Select|Pick)\s+['"]?([^'",\s]+)['"]?\s+or\s+['"]?([^'",\s]+)['"]?/i;
    const chooseMatch = text.match(choosePattern);
    if (chooseMatch && chooseMatch[1] && chooseMatch[2]) {
      // Found "Choose X or Y" format
      const option1 = chooseMatch[1].trim();
      const option2 = chooseMatch[2].trim();

      // Extract question text (everything before "Choose")
      const chooseIndex = text.indexOf(chooseMatch[0]);
      let questionText = text.substring(0, chooseIndex).trim();

      // Clean up question text
      questionText = questionText
        .replace(/^\*\*Question \d+:\*\*\s*/i, "")
        .replace(/^\*\*Question \d+ of \d+:\*\*\s*/i, "")
        .replace(/\*\*/g, "")
        .trim();

      // Remove the "Choose X or Y" part from question if it's still there
      questionText = questionText
        .replace(/(?:Choose|Select|Pick).*$/i, "")
        .trim();

      return {
        question: questionText || "Choose the correct option:",
        options: [
          { letter: "A", text: option1 },
          { letter: "B", text: option2 },
        ],
      };
    }

    // Also try pattern: "X or Y" when preceded by question words
    const orPattern = /(['"]?)([^'",\s]+)\1\s+or\s+(['"]?)([^'",\s]+)\3/i;
    const orMatch = text.match(orPattern);
    if (orMatch && orMatch[2] && orMatch[4]) {
      const option1 = orMatch[2].trim();
      const option2 = orMatch[4].trim();

      // Check if this appears in a question context
      const beforeOr = text.substring(0, orMatch.index || 0);
      const hasQuestionContext =
        /(choose|select|pick|which|what|fill|blank)/i.test(beforeOr);

      if (hasQuestionContext) {
        const orIndex = text.indexOf(orMatch[0]);
        let questionText = text.substring(0, orIndex).trim();

        // Clean up
        questionText = questionText
          .replace(/^\*\*Question \d+:\*\*\s*/i, "")
          .replace(/^\*\*Question \d+ of \d+:\*\*\s*/i, "")
          .replace(/\*\*/g, "")
          .trim();

        return {
          question: questionText || "Choose the correct option:",
          options: [
            { letter: "A", text: option1 },
            { letter: "B", text: option2 },
          ],
        };
      }
    }
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

  // Clean up question text - remove markdown formatting
  questionText = questionText
    .replace(/^\*\*Question \d+:\*\*\s*/i, "")
    .replace(/^\*\*Question \d+ of \d+:\*\*\s*/i, "")
    .replace(/\*\*/g, "")
    .trim();

  // Remove any trailing question marks or punctuation that might be part of the question
  questionText = questionText.replace(/\s*[?]\s*$/, "").trim();

  // Also remove the options from question text if they're still there (for inline format)
  // This handles cases where options are embedded in the question text
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

function separateInstructionsAndQuestion(text: string): {
  instructions: string;
  question: string | null;
} {
  // Transition phrases that separate feedback from new question
  const transitionPhrases = [
    /Let's try another one/i,
    /Let's try one more/i,
    /Now let's try/i,
    /Ready for another/i,
    /Here's another/i,
    /Next question/i,
    /Another one/i,
    /Your turn/i,
  ];

  // Question indicators - patterns that indicate a question/challenge is starting
  const questionIndicators = [
    /How would you/i,
    /How do you/i,
    /What is the/i,
    /What would you/i,
    /What do you/i,
    /Can you/i,
    /Try this/i,
    /Now try/i,
    /Try filling/i,
    /Try filling in/i,
    /Complete the/i,
    /Fill in/i,
    /Filling in/i,
    /Rewrite/i,
    /Choose/i,
    /Select/i,
  ];

  let instructions = text;
  let question: string | null = null;

  // First, check for transition phrases followed by questions
  for (const transitionPattern of transitionPhrases) {
    const transitionMatch = text.match(transitionPattern);
    if (transitionMatch && transitionMatch.index !== undefined) {
      const transitionEnd = transitionMatch.index + transitionMatch[0].length;
      const beforeTransition = text.substring(0, transitionMatch.index).trim();
      const afterTransition = text.substring(transitionEnd).trim();

      // Check if there's a question after the transition
      for (const indicator of questionIndicators) {
        const questionMatch = afterTransition.match(indicator);
        if (questionMatch && questionMatch.index !== undefined) {
          // Found question after transition
          instructions = beforeTransition;
          question = afterTransition.substring(questionMatch.index).trim();

          // Include the transition phrase in the question for context
          question = transitionMatch[0] + " " + question;

          if (instructions.length > 0 && question.length > 0) {
            return {
              instructions: instructions.trim(),
              question: question.trim(),
            };
          }
        }
      }

      // If transition found but no clear question indicator, check if there's a question mark or question-like text after
      if (afterTransition.length > 0) {
        // Look for question marks or question-like patterns
        const hasQuestionMark = afterTransition.includes("?");
        const hasQuestionWords =
          /(what|how|which|who|where|when|why|can|would|do|does|is|are|complete|fill|rewrite|choose|select)/i.test(
            afterTransition,
          );

        if (
          hasQuestionMark ||
          (hasQuestionWords && afterTransition.length > 20)
        ) {
          instructions = beforeTransition;
          question = transitionMatch[0] + " " + afterTransition;

          if (instructions.length > 0 && question.length > 0) {
            return {
              instructions: instructions.trim(),
              question: question.trim(),
            };
          }
        }
      }
    }
  }

  // Fallback: Look for question indicators directly
  let questionStart = text.length;
  for (const indicator of questionIndicators) {
    const match = text.match(indicator);
    if (match && match.index !== undefined) {
      questionStart = Math.min(questionStart, match.index);
    }
  }

  // If we found a question start
  if (questionStart < text.length) {
    instructions = text.substring(0, questionStart).trim();
    question = text.substring(questionStart).trim();

    // Clean up instructions - remove trailing punctuation/spaces
    instructions = instructions.replace(/\s+$/, "").trim();

    // Ensure we have actual content in both
    if (instructions.length > 0 && question.length > 0) {
      return { instructions, question };
    }
  }

  // If no question found, return all as instructions
  return { instructions: text, question: null };
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function Step5() {
  const {
    language,
    goals,
    level,
    setStep,
    callAi,
    isAiBusy,
    history,
    clearArea,
  } = useLanguagePractice();
  const [input, setInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const turns = history.grammar;
  const lastAi =
    [...turns].reverse().find((t) => t.role === "ai")?.content ?? "";

  // Check if lesson has started (has AI responses)
  const hasLessonStarted =
    turns.length > 0 && turns.some((t) => t.role === "ai");

  // Check if this is feedback (user has submitted answers before this AI response)
  const isFeedback = useMemo(() => {
    if (!hasLessonStarted || !lastAi) return false;
    // If there are user turns before the last AI turn, it's feedback
    const userTurns = turns.filter((t) => t.role === "user");
    return userTurns.length > 0;
  }, [turns, hasLessonStarted, lastAi]);

  // Check if lesson is complete
  const isComplete = useMemo(() => {
    if (!hasLessonStarted || !lastAi) return false;
    const lowerText = lastAi.toLowerCase();
    const completionPhrases = [
      "wrap up",
      "lesson complete",
      "that's all",
      "great work",
      "excellent work",
      "well done",
      "next lesson",
      "for today",
      "great job",
      "well done",
      "that's all for now",
      "lesson complete",
      "practice complete",
    ];
    return completionPhrases.some((phrase) => lowerText.includes(phrase));
  }, [hasLessonStarted, lastAi]);

  // Separate instructions/feedback from question
  const { instructions, question } = useMemo(() => {
    if (!lastAi) return { instructions: "", question: null };
    return separateInstructionsAndQuestion(lastAi);
  }, [lastAi]);

  // Parse MCQ from question text - also check the full lastAi text if question doesn't have options
  const mcqData = useMemo(() => {
    // First try parsing from the full AI response (might contain options in instructions or question)
    if (lastAi) {
      let parsed = parseMCQFromText(lastAi);
      if (parsed) return parsed;
    }
    // Then try parsing from the question text
    if (question) {
      let parsed = parseMCQFromText(question);
      if (parsed) return parsed;
    }
    return null;
  }, [question, lastAi]);

  // Check if this is a fill-in-the-blank question
  const isFillInTheBlank = useMemo(() => {
    if (!question && !lastAi) return false;
    const textToCheck = question || lastAi || "";
    // Check for fill-in-the-blank indicators
    const fillBlankPatterns = [
      /___/, // Underscores indicating blank
      /fill in the blank/i,
      /filling in the blank/i,
      /fill in/i,
      /complete the/i,
      /fill the blank/i,
    ];
    return fillBlankPatterns.some((pattern) => pattern.test(textToCheck));
  }, [question, lastAi]);

  // Determine if we should show MCQ or text input
  // If it's a fill-in-the-blank question, always show input field (not MCQ)
  const showMCQ =
    !isFillInTheBlank && mcqData !== null && mcqData.options.length >= 2;
  const showTextInput = !showMCQ && (question !== null || isFillInTheBlank);

  // Get the question text to display - if MCQ, use the parsed question without options
  const displayQuestionText = useMemo(() => {
    if (showMCQ && mcqData) {
      return mcqData.question; // MCQ question without options
    }
    return question; // Regular question text
  }, [showMCQ, mcqData, question]);

  const starterHint = useMemo(() => {
    return [
      "Explain ONE grammar rule clearly with examples.",
      "Then give a practice prompt (fill-in, rewrite, or choose correct form).",
      "When the learner answers: correct politely, explain why, and give one more practice.",
      "Include progressDelta.grammar (+2..+5) on correct answers, +1 for effort.",
    ].join("\n");
  }, []);

  const start = async () => {
    clearArea("grammar");
    setSelectedOption(null);
    setInput("");
    await callAi({
      area: "grammar",
      userInput:
        "Start a grammar mini-lesson. Explain one rule with examples, then give me a practice prompt.",
      hint: starterHint,
    });
  };

  const send = async () => {
    if (showMCQ && selectedOption) {
      const msg = selectedOption;
      setSelectedOption(null);
      await callAi({
        area: "grammar",
        userInput: msg,
        hint: "Correct politely, explain why, then give one more practice.",
      });
    } else if (showTextInput && input.trim()) {
      const msg = input.trim();
      setInput("");
      await callAi({
        area: "grammar",
        userInput: msg,
        hint: "Correct politely, explain why, then give one more practice.",
      });
    }
  };

  const meta = (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
        <span className="font-semibold">Language:</span> {language ?? "Not set"}
      </span>
      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
        <span className="font-semibold">Level:</span> {level ?? "TBD"}
      </span>
      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
        <span className="font-semibold">Goals:</span>{" "}
        {goals.length ? goals.join(", ") : "Not set"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
        <div className="text-sm font-semibold">Grammar that clicks</div>
        <div className="mt-1 text-sm text-gray-600">
          One rule at a time, with examples and practice.
        </div>
        <div className="mt-3">{meta}</div>
      </div>

      <Panel title="Grammar lesson">
        {/* New lesson button - Only show when lesson hasn't started */}
        {!hasLessonStarted && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Ready for a new rule? Tap &quot;New lesson&quot;.
            </div>
            <button
              type="button"
              onClick={start}
              disabled={isAiBusy || !language}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                isAiBusy || !language
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900",
              ].join(" ")}
              title={!language ? "Pick a language in Step 1" : undefined}
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
                "New lesson"
              )}
            </button>
          </div>
        )}

        {/* Feedback Box - Show when user has submitted answers (feedback on previous question) */}
        {isFeedback && instructions && (
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
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1447e6]">
                  Feedback
                </div>
                <div className="text-sm text-gray-800">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 leading-relaxed last:mb-0">
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
                      li: ({ children }) => (
                        <li className="my-1">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-2 text-lg font-bold text-gray-900">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-2 text-base font-bold text-gray-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-1 text-sm font-bold text-gray-900">
                          {children}
                        </h3>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {instructions}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruction Box - Show only for initial lesson (not feedback) */}
        {hasLessonStarted && !isFeedback && instructions && (
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1447e6]">
                  Lesson Instructions
                </div>
                <div className="text-sm text-gray-800">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 leading-relaxed last:mb-0">
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
                      li: ({ children }) => (
                        <li className="my-1">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-2 text-lg font-bold text-gray-900">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-2 text-base font-bold text-gray-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-1 text-sm font-bold text-gray-900">
                          {children}
                        </h3>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {instructions}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Box - Show separately when question exists */}
        {hasLessonStarted && displayQuestionText && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 text-sm text-gray-800 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Practice Question
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
                }}
              >
                {displayQuestionText}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* MCQ Options - Show when question is MCQ */}
        {hasLessonStarted && showMCQ && mcqData && (
          <div className="mb-4">
            <div className="mb-3 text-sm font-medium text-gray-700">
              Select your answer:
            </div>
            <div className="space-y-2">
              {mcqData.options.map((opt) => (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => setSelectedOption(opt.letter)}
                  disabled={isAiBusy}
                  className={[
                    "w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all",
                    selectedOption === opt.letter
                      ? "border-[#155dfc] bg-blue-50 shadow-md"
                      : "hover:border-gray-300 hover:shadow-md",
                    isAiBusy
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-bold",
                        selectedOption === opt.letter
                          ? "border-[#155dfc] bg-[#155dfc] text-white"
                          : "border-gray-300 bg-white text-gray-600",
                      ].join(" ")}
                    >
                      {opt.letter}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {opt.text}
                    </span>
                    {selectedOption === opt.letter && (
                      <svg
                        className="ml-auto h-5 w-5 text-[#155dfc]"
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
          </div>
        )}

        {/* Submit button for MCQ - Show when MCQ is selected */}
        {hasLessonStarted && showMCQ && (
          <button
            type="button"
            onClick={send}
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
                <span>Submitting...</span>
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

        {/* Text Input (when not MCQ) - Only show when there's a question and it's not MCQ */}
        {hasLessonStarted && showTextInput && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isAiBusy}
              placeholder="Answer the practice prompt…"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#2b7fff] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={send}
              disabled={isAiBusy || !input.trim()}
              className={[
                "group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200",
                isAiBusy || !input.trim()
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

        {/* Fallback message when no lesson started */}
        {!hasLessonStarted && !lastAi && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
            Tap &quot;New lesson&quot; to begin.
          </div>
        )}
      </Panel>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(6)}
          disabled={
            hasLessonStarted && !isComplete && (showMCQ || showTextInput)
          }
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all",
            hasLessonStarted && !isComplete && (showMCQ || showTextInput)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#155dfc] text-white hover:bg-[#1447e6]",
          ].join(" ")}
        >
          Continue to conversation
        </button>
      </div>
    </div>
  );
}
