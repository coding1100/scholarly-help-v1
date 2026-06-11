import {
  FiBookOpen,
  FiBarChart,
  FiBookmark,
  FiEdit3,
  FiFileText,
  FiHash,
  FiHelpCircle,
  FiGlobe,
  FiLayers,
  FiMessageSquare,
  FiPenTool,
  FiSmile,
  FiSearch,
  FiTarget,
  FiTriangle,
  FiZap,
} from "react-icons/fi";
import ToolCard, { type ToolCardData } from "./ToolCard";

const tools: ToolCardData[] = [
  {
    name: "Study Workspace",
    description:
      "Upload content and generate notes, summaries, flashcards, quizzes, and tutor help.",
    href: "/tools/study-workspace",
    icon: FiBookmark,
    badge: "New",
  },
  {
    name: "Academic Research Assistant",
    description: "Draft, rewrite, and improve with one focused editor.",
    href: "/tools/academic-research-assistant",
    icon: FiEdit3,
    badge: "Popular",
  },
  {
    name: "Paraphraser Tool",
    description: "Rephrase sentences to sound clearer and more academic.",
    href: "/tools/paraphraser-tool",
    icon: FiLayers,
  },
  {
    name: "Summarizer Tool",
    description: "Turn long readings into crisp, study-ready notes.",
    href: "/tools/summarizer-tool",
    icon: FiFileText,
  },
  {
    name: "Humanizer Tool",
    description: "Make AI text sound more natural and human.",
    href: "/tools/humanizer-tool",
    icon: FiSmile,
  },
  {
    name: "AI Thesis Statement Generator",
    description: "Generate strong thesis statements from your topic.",
    href: "/tools/thesis-generator-tool",
    icon: FiTarget,
  },
  {
    name: "Essay Outline Tool",
    description: "Create structured outlines that keep writing on track.",
    href: "/tools/essay-outline-tool",
    icon: FiBookOpen,
  },
  {
    name: "Essay Title Generator",
    description: "Get compelling titles that match your assignment tone.",
    href: "/tools/essay-title",
    icon: FiPenTool,
  },
  {
    name: "Research Question Generator",
    description: "Find clear, specific research questions fast.",
    href: "/tools/research-question",
    icon: FiSearch,
  },
  {
    name: "Pythagoras Equation Solver",
    description: "Solve right-triangle problems with clean steps.",
    href: "/tools/pythagoras-solver",
    icon: FiTriangle,
  },
  {
    name: "Citation Tool",
    description: "Create citations that look clean and consistent.",
    href: "/tools/citation-tool",
    icon: FiHash,
  },
  {
    name: "Tutor Tool",
    description: "Ask questions and get step-by-step explanations.",
    href: "/tools/tutor",
    icon: FiHelpCircle,
  },
  {
    name: "Micro Learning",
    description: "Learn in short, guided steps you can finish.",
    href: "/tools/micro-learning",
    icon: FiZap,
    badge: "Focus",
  },
  {
    name: "Exam Prep",
    description: "Practice smarter with guided prep and quick drills.",
    href: "/tools/exam-prep",
    icon: FiMessageSquare,
    badge: "New",
  },
  {
    name: "Language Practice",
    description: "Build fluency with structured practice sessions.",
    href: "/tools/language-practice",
    icon: FiGlobe,
  },
  {
    name: "CGPA Calculator",
    description: "Calculate GPA/CGPA with an easy semester view.",
    href: "/tools/cgpa-calculator",
    icon: FiBarChart,
  },
];

export default function ToolGrid() {
  return (
    <section
      id="tools"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your academic toolkit
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Choose a tool, get results quickly, and keep moving. Everything is
            designed to feel calm, premium, and easy to use.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-850 dark:text-gray-200">
          <div className="font-semibold">Tip for best results</div>
          <div className="mt-0.5 text-gray-600 dark:text-gray-300">
            Start with an outline, then paraphrase and polish.
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </div>
    </section>
  );
}
