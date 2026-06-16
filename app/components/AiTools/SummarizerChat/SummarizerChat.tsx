"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { FaCommentDots, FaTimes } from "react-icons/fa";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

interface SummarizerChatProps {
  /** The source content the assistant must ground its answers in (the user's
   *  pasted text / summary source). The widget is hidden when this is empty. */
  context: string;
}

const baseUrl =
  process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

export default function SummarizerChat({ context }: SummarizerChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasContext = context.trim().length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Don't render the widget at all until there is content to ground against.
  if (!hasContext) return null;

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) {
      toast.error("Please sign in to use the assistant.");
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/tools/summarizer/chat`,
        { context, messages: nextMessages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const reply = response.data?.data?.reply;
      if (!reply) throw new Error("No response from the assistant.");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
      // Roll back the optimistic user message so they can retry cleanly.
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Collapsed: a floating bubble in the bottom-right corner.
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open content assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#2b7fff] text-white shadow-lg shadow-[#2b7fff]/30 transition-all duration-200 hover:scale-110 hover:bg-[#155dfc] max-[420px]:bottom-4 max-[420px]:right-4"
      >
        <FaCommentDots className="text-xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-96 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 max-[420px]:bottom-3 max-[420px]:right-3 max-[420px]:left-3 max-[420px]:h-[80vh] max-[420px]:w-auto">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            Content Assistant
          </h3>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            Answers from your pasted content only
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close assistant"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask a question about the content you pasted and I&apos;ll answer
              from it.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#2b7fff] text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="space-y-2 [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="my-1">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="my-1 ml-4 list-disc space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="my-1 ml-4 list-decimal space-y-1">
                            {children}
                          </ol>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-3 py-3 dark:bg-gray-800">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#2b7fff]" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-[#2b7fff]"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-[#2b7fff]"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          placeholder="Ask about your content..."
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 rounded-xl bg-[#2b7fff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#155dfc] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
