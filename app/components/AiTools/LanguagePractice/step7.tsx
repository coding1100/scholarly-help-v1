"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguagePractice } from "@/app/context/LanguagePracticeContext";

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
    /Let's start with/i,
    /Let's start/i,
    /Your turn/i,
    /Now, you try/i,
    /Now you try/i,
  ];

  // Question indicators - patterns that indicate a question/challenge is starting
  const questionIndicators = [
    /How would you/i,
    /How do you/i,
    /What is the/i,
    /What would you/i,
    /What do you/i,
    /What does/i,
    /What is/i,
    /What are/i,
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
    /Imagine you're/i,
    /Imagine you/i,
    /Ready for a quick challenge/i,
    /Ready for a challenge/i,
    /Now let's practice/i,
    /Let's practice/i,
    /Time to practice/i,
    /Here's a challenge/i,
    /Here's your challenge/i,
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
          /(what|how|which|who|where|when|why|can|would|do|does|is|are|complete|fill|rewrite|choose|select|greet|say|tell|write|translate|type)/i.test(
            afterTransition,
          );

        // Check if the text after transition looks like a question
        if (
          hasQuestionMark ||
          (hasQuestionWords && afterTransition.length > 10)
        ) {
          instructions = beforeTransition;
          // Include the transition phrase in the question for context
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

  // Also check for questions that start with "How would you" or similar patterns directly
  for (const indicator of questionIndicators) {
    const match = text.match(indicator);
    if (match && match.index !== undefined && match.index > 0) {
      // Found a question indicator, check if there's content before it that looks like feedback
      const beforeQuestion = text.substring(0, match.index).trim();
      const questionText = text.substring(match.index).trim();

      // Check if beforeQuestion contains feedback patterns
      const feedbackPatterns = [
        /(no worries|don't worry|whoops|that's|let's try|let's start|not quite|correct|incorrect|good|great|well done)/i,
        /(means|remember|so|you're doing|hmm|oops)/i,
      ];

      const hasFeedback = feedbackPatterns.some((pattern) =>
        pattern.test(beforeQuestion),
      );

      // If there's feedback-like content before the question, separate them
      if (
        hasFeedback &&
        beforeQuestion.length > 10 &&
        questionText.length > 0
      ) {
        return {
          instructions: beforeQuestion.trim(),
          question: questionText.trim(),
        };
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

export default function Step7() {
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
  const [isListening, setIsListening] = useState(false);

  const turns = history.pronunciation;
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

  // Separate instructions/feedback from question
  const { instructions, question } = useMemo(() => {
    if (!lastAi) return { instructions: "", question: null };
    return separateInstructionsAndQuestion(lastAi);
  }, [lastAi]);

  const starterHint = useMemo(() => {
    return [
      "Give text-based pronunciation practice (no audio required).",
      "Provide phonetic hints (IPA or simplified phonetics) and explain mouth/tongue position.",
      "Give a phrase or sentence to practice, then ask the learner to type how they think it sounds.",
      "When they respond: give feedback on pronunciation (text-based), correct gently, and suggest improvements.",
      "Include progressDelta.pronunciation (+2..+5) for good attempts, +1 for effort.",
    ].join("\n");
  }, []);

  const start = async () => {
    clearArea("pronunciation");
    await callAi({
      area: "pronunciation",
      userInput:
        "Start a pronunciation practice session. Give me a phrase with phonetic hints, then ask me to practice.",
      hint: starterHint,
    });
  };

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    await callAi({
      area: "pronunciation",
      userInput: msg,
      hint: "Give text-based feedback on pronunciation, then suggest the next practice phrase.",
    });
  };

  const speakPrompt = () => {
    if (!("speechSynthesis" in window) || !lastAi) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastAi.replace(/[*_#`]/g, ""));
    const matchingVoice = window.speechSynthesis.getVoices().find((voice) =>
      language ? voice.lang.toLowerCase().includes(language.slice(0, 2).toLowerCase()) : false,
    );
    if (matchingVoice) utterance.voice = matchingVoice;
    window.speechSynthesis.speak(utterance);
  };

  const listen = () => {
    type RecognitionEvent = Event & { results: ArrayLike<{ 0: { transcript: string } }> };
    type Recognition = { lang: string; interimResults: boolean; onresult: (event: RecognitionEvent) => void; onend: () => void; onerror: () => void; start: () => void };
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SpeechRecognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language || navigator.language;
    recognition.interimResults = false;
    recognition.onresult = (event) => setInput(event.results[0]?.[0]?.transcript || "");
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
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
        <div className="text-sm font-semibold">
          Pronunciation practice
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Hear a model phrase, speak it aloud, and receive structured feedback.
        </div>
        <div className="mt-3">{meta}</div>
      </div>

      <Panel title="Pronunciation coach">
        {/* New practice button - Only show when lesson hasn't started */}
        {!hasLessonStarted && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Ready to practice? Tap "New practice".
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
                "New practice"
              )}
            </button>
          </div>
        )}

        {/* Lesson content - Show when lesson has started */}
        {hasLessonStarted && lastAi && (
          <div className="mt-3 space-y-3">
            {/* Feedback Box */}
            {isFeedback && instructions && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2b7fff] text-xs font-bold text-white">
                    i
                  </div>
                  <div className="text-sm font-bold text-[#1447e6]">
                    FEEDBACK
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-sm text-gray-700">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5 last:mb-0">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5 last:mb-0">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        ) : (
                          <code className="block rounded bg-gray-200 px-2 py-1 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {instructions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Instructions Box (initial, not feedback) */}
            {!isFeedback && instructions && !question && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Lesson Instructions
                </div>
                <div className="prose prose-sm max-w-none text-sm text-gray-700">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5 last:mb-0">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5 last:mb-0">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        ) : (
                          <code className="block rounded bg-gray-200 px-2 py-1 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {instructions}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Practice Question Section */}
            {question && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Practice Question
                </div>
                <div className="prose prose-sm max-w-none text-sm text-gray-800">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5 last:mb-0">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5 last:mb-0">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        ) : (
                          <code className="block rounded bg-gray-200 px-2 py-1 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {question}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* If no separation worked, show full content as instructions */}
            {!instructions && !question && lastAi && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="prose prose-sm max-w-none text-sm text-gray-700">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-5 last:mb-0">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-5 last:mb-0">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        ) : (
                          <code className="block rounded bg-gray-200 px-2 py-1 text-xs font-mono text-gray-800">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {lastAi}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback message when no lesson started */}
        {!hasLessonStarted && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
            Tap "New practice" to begin.
          </div>
        )}

        {/* Input field and Send button - Only show when lesson has started */}
        {hasLessonStarted && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={isAiBusy}
              placeholder="Type how you think it sounds…"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />
            <button type="button" onClick={speakPrompt} disabled={!lastAi} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50" aria-label="Listen to pronunciation prompt">Listen</button>
            <button type="button" onClick={listen} disabled={isListening} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50" aria-label="Record spoken attempt">{isListening ? "Listening…" : "Speak"}</button>
            <button
              type="button"
              onClick={send}
              disabled={isAiBusy || !input.trim()}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                isAiBusy || !input.trim()
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#155dfc] text-white hover:bg-[#1447e6]",
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
                "Send"
              )}
            </button>
          </div>
        )}
      </Panel>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(6)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(8)}
          className="rounded-xl bg-[#155dfc] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1447e6]"
        >
          View progress
        </button>
      </div>
    </div>
  );
}
