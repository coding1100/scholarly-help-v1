"use client";

import { useChat } from "@/app/context/ChatContext";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, addMessage, sendMessage } = useChat();

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If user opens chat manually (without any step-triggered message yet),
  // we show a small placeholder instead of an infinite loader.

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const messageText = inputMessage.trim();
      setInputMessage("");

      try {
        await sendMessage(messageText);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <span>{errorMessage}</span>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await sendMessage(messageText);
                  } catch (e) {
                    // Error already handled by toast
                  }
                }}
                className="text-[#2b7fff] hover:text-[#155dfc] underline text-sm"
              >
                Retry
              </button>
            </div>
          ),
          { duration: 5000 },
        );
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputMessage.trim() && !isLoading) {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    // Minimized state - circular button
    return (
      <div className="fixed bottom-6 right-6 z-50 max-[420px]:right-4 max-[420px]:bottom-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-purple-400/80 backdrop-blur-md border-2 border-white/40 shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-all duration-200 cursor-pointer max-[420px]:w-14 max-[420px]:h-14"
        >
          <span className="text-2xl max-[420px]:text-xl">💬</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-[420px]:left-3 max-[420px]:right-3 max-[420px]:bottom-3 max-[420px]:w-[calc(100vw-24px)] max-[420px]:max-w-none max-[420px]:h-[85vh] flex flex-col bg-white">
      {/* Main Chat Container */}
      <div className="h-full min-w-0 backdrop-blur-xl bg-white/30 border border-white/40 rounded-t-3xl rounded-br-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-t-3xl rounded-br-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 flex items-center justify-between gap-2 p-4 border-b border-white/20 bg-white/20 backdrop-blur-md min-w-0">
            <h2 className="text-xl font-bold text-black truncate">
              Chat with Tutor
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-gray-300/50 flex items-center justify-center hover:bg-white/50 transition-all cursor-pointer"
            >
              <span className="text-gray-600 text-lg font-bold">−</span>
            </button>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-600 text-sm text-center">
                  Ask a follow-up after your Tutor result.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.sender === "tutor"
                          ? "bg-[#2b7fff]/30 backdrop-blur-md border border-[#51a2ff]/30"
                          : "bg-gray-500/30 backdrop-blur-md border border-gray-400/30"
                      }`}
                    >
                      <div className="text-black text-sm leading-relaxed prose prose-sm max-w-none">
                        {message.sender === "tutor" ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="ml-2">{children}</li>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.text}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#2b7fff]/30 backdrop-blur-md border border-[#51a2ff]/30 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#2b7fff] rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-[#2b7fff] rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#2b7fff] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-white/20 bg-white/20 backdrop-blur-md min-w-0">
            <div className="flex gap-2 min-w-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder="Type your message..."
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
