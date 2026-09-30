"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguagePractice } from "@/app/context/LanguagePracticeContext";

function MessageBubble({
  role,
  content,
}: {
  role: "user" | "ai";
  content: string;
}) {
  return (
    <div
      className={[
        "flex",
        role === "user" ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          role === "user"
            ? "bg-[#155dfc] text-white"
            : "bg-gray-100 text-gray-800",
        ].join(" ")}
      >
        {role === "ai" ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 list-decimal pl-5 last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
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
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </div>
  );
}

export default function Step6() {
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

  const turns = history.conversation;
  const starterHint = useMemo(() => {
    return [
      "Act as a natural conversation partner in a real-world scenario.",
      "Pick a scenario that matches the user's goals (travel, work, casual, etc.).",
      "Keep it natural — not robotic or overly formal.",
      "Adapt difficulty automatically. If they struggle, simplify; if they excel, add nuance.",
      "Occasionally correct mistakes naturally (e.g., 'Oh, you mean...') without breaking flow.",
      "Include progressDelta.conversation (+2..+5) for good exchanges, +1 for effort.",
    ].join("\n");
  }, []);

  const start = async () => {
    clearArea("conversation");
    await callAi({
      area: "conversation",
      userInput:
        "Start a conversation in a real-world scenario that matches my goals. Be natural and friendly.",
      hint: starterHint,
    });
  };

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    await callAi({
      area: "conversation",
      userInput: msg,
      hint: "Continue the conversation naturally. Adapt difficulty and correct gently if needed.",
    });
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
          Real-world conversation practice
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Chat naturally — I&apos;ll adapt and help you improve as we go.
        </div>
        <div className="mt-3">{meta}</div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Conversation</div>
          <button
            type="button"
            onClick={start}
            disabled={isAiBusy || !language}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition",
              isAiBusy || !language
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900",
            ].join(" ")}
            title={!language ? "Pick a language in Step 1" : undefined}
          >
            {isAiBusy ? (
              <>
                <svg
                  className="h-3 w-3 animate-spin"
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
              "New conversation"
            )}
          </button>
        </div>

        <div className="flex min-h-[200px] flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {turns.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Tap &quot;New conversation&quot; to start chatting.
            </div>
          ) : (
            turns.map((t) => (
              <MessageBubble key={t.id} role={t.role} content={t.content} />
            ))
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={isAiBusy || turns.length === 0}
            placeholder="Type your message…"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#155dfc] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={isAiBusy || !input.trim() || turns.length === 0}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
              isAiBusy || !input.trim() || turns.length === 0
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
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(5)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(7)}
          className="rounded-xl bg-[#155dfc] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1447e6]"
        >
          Continue to pronunciation
        </button>
      </div>
    </div>
  );
}
