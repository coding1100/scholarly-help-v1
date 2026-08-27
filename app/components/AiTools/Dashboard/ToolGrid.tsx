"use client";

import { useMemo, useState } from "react";
import {
  FiAlignLeft,
  FiBarChart,
  FiBookmark,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiList,
  FiGlobe,
  FiMessageSquare,
  FiRepeat,
  FiSearch,
  FiTarget,
  FiType,
  FiZap,
} from "react-icons/fi";
import { LuGraduationCap, LuRadical } from "react-icons/lu";
import { RiDoubleQuotesL } from "react-icons/ri";
import ToolCard, {
  type ToolCardData,
  type ToolCategory,
} from "./ToolCard";

const tools: ToolCardData[] = [
  // Study tools
  {
    name: "Study Workspace",
    description:
      "Upload content and generate notes, summaries, flashcards, quizzes, and tutor help.",
    href: "/tools/study-workspace",
    icon: FiBookmark,
    badge: "New",
    category: "study-tools",
    cta: "Open workspace",
  },
  {
    name: "Summarizer Tool",
    description: "Turn long readings into crisp, study-ready notes.",
    href: "/tools/summarizer-tool",
    icon: FiAlignLeft,
    badge: "Popular",
    category: "study-tools",
    cta: "Summarize now",
  },
  {
    name: "Tutor Tool",
    description: "Ask questions and get step-by-step explanations.",
    href: "/tools/tutor",
    icon: LuGraduationCap,
    badge: "New",
    category: "study-tools",
    cta: "Ask a question",
  },
  {
    name: "CGPA Calculator",
    description: "Calculate GPA/CGPA with an easy semester view.",
    href: "/tools/cgpa-calculator",
    icon: FiBarChart,
    badge: "Free",
    category: "study-tools",
    cta: "Calculate GPA",
  },
  {
    name: "Exam Prep Tool",
    description: "Practice smarter with guided prep and quick drills.",
    href: "/tools/exam-prep",
    icon: FiMessageSquare,
    badge: "New",
    category: "study-tools",
    cta: "Start prep",
  },
  {
    name: "Language Practice",
    description: "Build fluency with structured practice sessions.",
    href: "/tools/language-practice",
    icon: FiGlobe,
    badge: "New",
    category: "study-tools",
    cta: "Start practice",
  },
  {
    name: "Micro Learning",
    description: "Learn in short, guided steps you can finish.",
    href: "/tools/micro-learning",
    icon: FiZap,
    badge: "New",
    category: "study-tools",
    cta: "Start learning",
  },
  {
    name: "AI Course Planner",
    description:
      "Build a conflict-free semester schedule, track attendance, and manage coursework in one workspace.",
    href: "/tools/course-planner",
    icon: FiCalendar,
    badge: "New",
    category: "study-tools",
    cta: "Plan my semester",
  },

  // Essay writing
  {
    name: "AI Essay Generator",
    description: "Build a structured academic draft from a topic and requirements.",
    href: "/tools/ai-essay-generator",
    icon: FiFileText,
    badge: "New",
    category: "essay-writing",
    cta: "Generate essay",
  },
  {
    name: "Essay Grader",
    description:
      "Score an essay against academic, admissions, scholarship, or custom rubrics and revise exact-text issues.",
    href: "/tools/essay-grader",
    icon: FiCheckCircle,
    badge: "New",
    category: "essay-writing",
    cta: "Grade my essay",
  },
  {
    name: "AI Paraphraser",
    description: "Rephrase sentences to sound clearer and more academic.",
    href: "/tools/paraphraser-tool",
    icon: FiRepeat,
    badge: "Free",
    category: "essay-writing",
    cta: "Paraphrase text",
  },
  {
    name: "Essay Title Generator",
    description: "Get compelling titles that match your assignment tone.",
    href: "/tools/essay-title",
    icon: FiType,
    badge: "Popular",
    category: "essay-writing",
    cta: "Generate title",
  },
  {
    name: "Essay Outline Tool",
    description: "Create structured outlines that keep writing on track.",
    href: "/tools/essay-outline-tool",
    icon: FiList,
    badge: "Popular",
    category: "essay-writing",
    cta: "Build outline",
  },
  {
    name: "Humanizer Tool",
    description: "Make AI text sound more natural and human.",
    href: "/tools/humanizer-tool",
    icon: LuGraduationCap,
    badge: "New",
    category: "essay-writing",
    cta: "Humanize text",
  },
  {
    name: "AI Detector",
    description:
      "Check if text reads as AI-generated, with sentence-level highlights.",
    href: "/tools/ai-detector-tool",
    icon: FiSearch,
    badge: "New",
    category: "essay-writing",
    cta: "Check for AI",
  },
  {
    name: "Plagiarism Checker",
    description:
      "Find matching passages across web and academic sources with detailed reports.",
    href: "/tools/plagiarism-checker",
    icon: FiSearch,
    badge: "New",
    category: "essay-writing",
    cta: "Check originality",
  },
  {
    name: "Grammar Checker",
    description:
      "Fix grammar, tense, clarity, and tone with inline explanations.",
    href: "/tools/grammar-checker",
    icon: FiCheckCircle,
    badge: "New",
    category: "essay-writing",
    cta: "Check my grammar",
  },

  // Research
  {
    name: "AI Thesis Generator",
    description: "Generate strong thesis statements from your topic.",
    href: "/tools/thesis-generator-tool",
    icon: FiTarget,
    badge: "Popular",
    category: "research",
    cta: "Build thesis",
  },
  {
    name: "Research Question Generator",
    description: "Find clear, specific research questions fast.",
    href: "/tools/research-question",
    icon: FiSearch,
    badge: "Free",
    category: "research",
    cta: "Generate question",
  },
  {
    name: "Academic Research Assistant",
    description: "Draft, rewrite, and improve with one focused editor.",
    href: "/tools/academic-research-assistant",
    icon: FiFileText,
    badge: "Popular",
    category: "research",
    cta: "Start research",
  },
  {
    name: "Citation Generator",
    description: "Create citations that look clean and consistent.",
    href: "/tools/citation-tool",
    icon: RiDoubleQuotesL,
    badge: "Popular",
    category: "research",
    cta: "Generate citation",
  },

  // Math & Science
  {
    name: "Math Solver",
    description: "Solve right-triangle problems with clean steps.",
    href: "/tools/math-solver",
    icon: LuRadical,
    badge: "Popular",
    category: "math-science",
    cta: "Solve equation",
  },
];

type TabKey = "all" | ToolCategory;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All tools" },
  { key: "essay-writing", label: "Essay writing" },
  { key: "research", label: "Research" },
  { key: "math-science", label: "Math & Science" },
  { key: "study-tools", label: "Study tools" },
];

export default function ToolGrid() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const visibleTools = useMemo(
    () =>
      activeTab === "all"
        ? tools
        : tools.filter((tool) => tool.category === activeTab),
    [activeTab],
  );

  const toolCount = visibleTools.length;

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Category tabs — horizontally scrollable on mobile, wrap on desktop. */}
      <div
        role="tablist"
        aria-label="Tool categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
                active
                  ? "border-primary-400 bg-primary-400 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {toolCount} {toolCount === 1 ? "tool" : "tools"}
      </p>

      {visibleTools.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTools.map((tool) => (
            <ToolCard key={`${tool.category}-${tool.href}`} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          No tools in this category yet.
        </p>
      )}
    </section>
  );
}
