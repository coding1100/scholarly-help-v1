"use client";

import { StudyLearningMode } from "@/app/utils/studyApiClient";

const MODES: Array<{
  id: StudyLearningMode;
  label: string;
  description: string;
}> = [
  {
    id: "research",
    label: "Research",
    description: "Understand deeply in plain language",
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Practice questions & test-ready facts",
  },
  {
    id: "exam",
    label: "Exam",
    description: "High-yield notes for your test only",
  },
];

export default function StudyLearningModeBar({
  mode,
  examTopicCount = 0,
  onModeChange,
  onConfigureExamTopics,
}: {
  mode: StudyLearningMode;
  examTopicCount?: number;
  onModeChange: (mode: StudyLearningMode) => void;
  onConfigureExamTopics?: () => void;
}) {
  return (
    <div className="mb-3 rounded-xl border border-[#dfe3ff] bg-white p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-1 text-xs font-semibold uppercase tracking-wide text-[#6b73ab]">
          Learning mode
        </span>
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onModeChange(item.id)}
            title={item.description}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === item.id
                ? "bg-gradient-to-r from-[#5f70ff] to-[#6d57ff] text-white shadow-sm"
                : "bg-[#f3f5ff] text-[#4b57b8] hover:bg-[#e8ebff]"
            }`}
          >
            {item.label}
          </button>
        ))}
        {mode === "exam" && onConfigureExamTopics ? (
          <button
            type="button"
            onClick={onConfigureExamTopics}
            className="ml-auto rounded-lg border border-[#c9d1ff] bg-[#f9faff] px-3 py-1.5 text-xs font-semibold text-[#5f70ff] hover:bg-[#eef1ff]"
          >
            {examTopicCount > 0
              ? `Exam topics (${examTopicCount})`
              : "Exam topics"}
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-[#7a7fa8]">
        {MODES.find((m) => m.id === mode)?.description}
      </p>
    </div>
  );
}
