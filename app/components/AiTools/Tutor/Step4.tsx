"use client";

import { useState } from "react";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface Topic {
  id: string;
  emoji: string;
  name: string;
}

interface Step4Props {
  subject: string;
  topics: Topic[];
  onContinue?: (topic: string) => void;
}

export default function Step4({
  subject,
  topics,
  onContinue,
}: Step4Props) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCustomTopic(""); // Clear custom input when selecting a card
  };

  const handleCustomInputChange = (value: string) => {
    setCustomTopic(value);
    setSelectedTopicId(null); // Clear card selection when entering custom text
  };

  const handleStartLearning = () => {
    const topic = selectedTopicId
      ? topics.find((t) => t.id === selectedTopicId)?.name || ""
      : customTopic.trim();

    if (topic) {
      onContinue?.(topic);
    }
  };

  const isButtonEnabled = selectedTopicId !== null || customTopic.trim() !== "";

  const selectedTopic = selectedTopicId
    ? topics.find((t) => t.id === selectedTopicId)
    : null;

  return (
    <div className="h-[calc(100vh-9vh)] overflow-y-auto">
      <div className="flex items-center justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-4xl relative">
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Title */}
              <p className="text-xl font-semibold text-black text-center mb-3 leading-tight">
                Choose a Topic to Learn 🎓
              </p>

              {/* Subtitle */}
              <p className="text-gray-600 text-center mb-8 text-sm">
                Select a {subject.toLowerCase()} topic to start learning and
                practicing!
              </p>

              {/* Topic Cards Grid */}
              {topics.length > 0 ? (
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic.id)}
                      className={`p-4 rounded-xl bg-white/40 backdrop-blur-md border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${selectedTopicId === topic.id
                        ? "border-[#2b7fff] shadow-lg shadow-[#2b7fff]/30"
                        : "border-gray-300/50 hover:border-gray-400/50"
                        }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        {/* Emoji */}
                        <div className="text-3xl mb-2">{topic.emoji}</div>

                        {/* Topic Name */}
                        <h3 className="text-sm md:text-base font-semibold text-black leading-tight">
                          {topic.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative flex justify-center items-center mb-8 py-8 min-h-[120px]">
                  <ToolsApiLoader show={topics.length === 0} contained respectToolsSidebar={false} />
                </div>
              )}

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white/30 backdrop-blur-md px-4 text-gray-600 text-sm">
                    Or enter your own topic:
                  </span>
                </div>
              </div>

              {/* Custom Topic Input and Button */}
              <div className="sm:flex gap-4 items-end">
                {/* Input Field */}
                <div className="flex-1">
                  <input
                    id="customTopic"
                    type="text"
                    value={customTopic}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && isButtonEnabled) {
                        handleStartLearning();
                      }
                    }}
                    placeholder={`e.g., ${subject} topic...`}
                    className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-gray-300/50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]/50 focus:border-[#2b7fff]/50 transition-all text-sm"
                  />
                </div>

                {/* Start Learning Button */}
                <button
                  onClick={handleStartLearning}
                  disabled={!isButtonEnabled}
                  className="sm:mt-0 mt-2 sm:w-fit w-full py-3.5 px-4 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
                >
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
}
