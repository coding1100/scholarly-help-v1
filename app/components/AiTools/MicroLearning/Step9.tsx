"use client";

import { sendMicroLearningMessage } from "@/app/utilities/api";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface Step9Props {
  duration: number;
  topic: string;
  onBack?: () => void;
  onTestUnderstanding?: (conversationId: string) => void;
  onCompleteLesson?: () => void;
}

export default function Step9({
  duration,
  topic,
  onBack,
  onTestUnderstanding,
  onCompleteLesson,
}: Step9Props) {
  const [lessonContent, setLessonContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const fetchLesson = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const message = `I want to learn ${topic} in ${duration} minutes.

Please provide:
1) A focused micro-lesson sized for ${duration} minutes
2) Clear examples (and short visual/structured aids if useful)
3) 2-3 quick practice questions at the end (with answers)
4) Brief feedback/explanations for the answers`;

      const response = await sendMicroLearningMessage(message, conversationId);
      setLessonContent(response.message);
      setConversationId(response.conversation_id);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load lesson. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, topic]);

  return (
    <div className="relative w-full overflow-x-hidden break-words flex justify-center py-4 mb-6 bg-linear-to-br from-gray-100 to-gray-200">
      <ToolsApiLoader show={isLoading} />
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8">
        {/* Header Bar */}
        <div className="bg-[#F0F0F0] rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-[#5A5A5A] text-white font-bold text-sm">
              {duration} min
            </span>
            <span className="text-[#333333] font-semibold text-lg">
              {topic}
            </span>
          </div>
          {/* <button
                        onClick={onCompleteLesson}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Mark Complete
                    </button> */}
        </div>

        {/* Main Content Card */}
        <div className="w-full bg-[#F0F0F0] rounded-3xl p-4 md:p-8 shadow-2xl overflow-x-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-[#fb2c36] text-4xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-[#333333] mb-2">
                Something went wrong
              </h3>
              <p className="text-[#666666] text-center mb-6 max-w-md">
                {error}
              </p>
              <button
                onClick={fetchLesson}
                className="px-6 py-3 rounded-xl bg-linear-to-r from-[#6C757D] to-[#868E96] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="prose prose-lg max-w-full break-words [&_*]:break-words">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4 mt-6 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-3 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3 mt-5">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-xl md:text-2xl font-bold text-[#4A90E2] mb-2 mt-4">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#333333] mb-4 leading-relaxed break-words">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#4A90E2]">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-[#666666]">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-[#333333]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-[#333333]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-4 break-words">{children}</li>
                  ),
                  hr: () => <hr className="my-6 border-t-2 border-[#D7D7D7]" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#4A90E2] pl-4 italic text-[#666666] my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {lessonContent}
              </ReactMarkdown>
            </div>
          )}

          {/* Bottom Buttons */}
          {!isLoading && !error && (
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (conversationId && onTestUnderstanding) {
                    onTestUnderstanding(conversationId);
                  }
                }}
                disabled={!conversationId}
                className="px-8 py-2 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                Test Your Understanding 📝
              </button>
              {/* <button
                                onClick={onCompleteLesson}
                                className="px-8 py-2  rounded-lg border-2 border-[#6C757D] text-[#6C757D] font-semibold bg-transparent hover:bg-[#6C757D]/10 transition-all duration-200"
                            >
                                Complete Lesson ✓
                            </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
