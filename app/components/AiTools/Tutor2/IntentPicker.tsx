"use client";

import { FC } from "react";
import { FiBookOpen, FiEdit3, FiCheckSquare } from "react-icons/fi";

export type TutorTab = "research" | "assignment" | "quiz";

interface IntentOption {
  tab: TutorTab;
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
}

const OPTIONS: IntentOption[] = [
  {
    tab: "research",
    icon: FiBookOpen,
    title: "Research & Deep Dive",
    description: "Synthesize concepts, get structured breakdowns, and cite your material.",
  },
  {
    tab: "assignment",
    icon: FiEdit3,
    title: "Solve Assignment",
    description: "A Socratic co-pilot: guiding questions and hints, not flat answers.",
  },
  {
    tab: "quiz",
    icon: FiCheckSquare,
    title: "Take Quiz",
    description: "Active recall practice generated from your document, with real scoring.",
  },
];

interface IntentPickerProps {
  onSelect: (tab: TutorTab) => void;
}

/**
 * Shown once a source is attached. Picking an intent sets the initially
 * active tab — the underlying `mode` is threaded into the very first tutor
 * message so the system prompt immediately reflects the choice. All three
 * tabs remain reachable afterward from the sidebar.
 */
const IntentPicker: FC<IntentPickerProps> = ({ onSelect }) => (
  <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
    <div className="text-center">
      <h2 className="text-lg font-semibold text-gray-800">What do you want to do first?</h2>
      <p className="mt-1 text-sm text-gray-500">
        You can switch between all three anytime from the sidebar.
      </p>
    </div>
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.tab}
            type="button"
            onClick={() => onSelect(option.tab)}
            className="flex flex-col items-start gap-2 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-primary-400 hover:bg-primary-100"
          >
            <Icon className="h-6 w-6 text-primary-400" />
            <span className="text-sm font-semibold text-gray-800">{option.title}</span>
            <span className="text-xs text-gray-500">{option.description}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default IntentPicker;
