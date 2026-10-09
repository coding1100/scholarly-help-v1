import {
  FiAlignLeft,
  FiBarChart,
  FiBookmark,
  FiCheckCircle,
  FiFileText,
  FiList,
  FiRepeat,
  FiSearch,
  FiTarget,
  FiType,
} from "react-icons/fi";
import { LuGraduationCap, LuRadical } from "react-icons/lu";
import { RiDoubleQuotesL } from "react-icons/ri";
import type { ToolCardData, ToolCategory, ToolGroup } from "./ToolCard";

/**
 * Single source of truth for every live tool in the product. The
 * dashboard grid (ToolGrid.tsx) and the AI tools sidebar (MTSidebar.tsx)
 * both render from this same list, so the two surfaces can never drift out
 * of sync with which tools actually exist. Tools marked `hidden` are left
 * out of both, and their routes redirect (see next.config.js).
 */
export const TOOLS: ToolCardData[] = [
  // Study tools
  {
    name: "AI Tutor",
    description:
      "Upload content and generate notes, summaries, flashcards, quizzes, and tutor help.",
    href: "/tools/study-workspace",
    icon: FiBookmark,
    badge: "New",
    category: "study-tools",
    group: "study-lab",
    keywords: ["notes", "flashcards", "quiz", "summary", "upload"],
    cta: "Open AI Tutor",
  },
  {
    name: "Summarizer Tool",
    description: "Turn long readings into crisp, study-ready notes.",
    href: "/tools/summarizer-tool",
    icon: FiAlignLeft,
    badge: "Popular",
    category: "study-tools",
    group: "study-lab",
    keywords: ["summary", "summarise", "condense", "tldr", "notes"],
    cta: "Summarize now",
    hidden: true,
  },
  {
    name: "Tutor (Legacy)",
    description:
      "Upload your material, then research deep-dive, solve assignments Socratically, or take a quiz — all grounded in your own document.",
    href: "/tools/tutor",
    icon: LuGraduationCap,
    badge: "New",
    category: "study-tools",
    group: "study-lab",
    keywords: ["tutor", "explain", "ask", "socratic", "learn"],
    cta: "Ask a question",
    hidden: true,
  },
  {
    name: "CGPA Calculator",
    description: "Calculate GPA/CGPA with an easy semester view.",
    href: "/tools/cgpa-calculator",
    icon: FiBarChart,
    badge: "Free",
    category: "study-tools",
    group: "study-lab",
    keywords: ["gpa", "cgpa", "grade", "calculator", "semester"],
    cta: "Calculate GPA",
  },

  // Essay writing
  {
    name: "Essay Studio",
    description:
      "All-in-one essay builder: thesis, outline, draft generator, plus a discussion board assistant.",
    href: "/tools/essay-studio",
    icon: FiFileText,
    badge: "New",
    category: "essay-writing",
    group: "writer-lab",
    keywords: [
      "essay studio",
      "essay builder",
      "draft",
      "write essay",
      "generator",
      "thesis",
      "outline",
      "discussion post",
    ],
    cta: "Open Essay Studio",
  },
  {
    name: "Essay Grader",
    description:
      "Score an essay against academic, admissions, scholarship, or custom rubrics and revise exact-text issues.",
    href: "/tools/essay-grader",
    icon: FiCheckCircle,
    badge: "New",
    category: "essay-writing",
    group: "writer-lab",
    keywords: ["grade", "rubric", "score", "feedback", "mark"],
    cta: "Grade my essay",
  },
  {
    name: "AI Paraphraser",
    description: "Rephrase sentences to sound clearer and more academic.",
    href: "/tools/paraphraser-tool",
    icon: FiRepeat,
    badge: "Free",
    category: "essay-writing",
    group: "originality",
    keywords: ["rephrase", "reword", "rewrite", "spinner"],
    cta: "Paraphrase text",
  },
  {
    name: "Essay Title Generator",
    description: "Get compelling titles that match your assignment tone.",
    href: "/tools/essay-title",
    icon: FiType,
    badge: "Popular",
    category: "essay-writing",
    group: "writer-lab",
    keywords: ["title", "headline", "name my essay"],
    cta: "Generate title",
    hidden: true,
  },
  {
    name: "Essay Outline Tool",
    description: "Create structured outlines that keep writing on track.",
    href: "/tools/essay-outline-tool",
    icon: FiList,
    badge: "Popular",
    category: "essay-writing",
    group: "writer-lab",
    keywords: ["outline", "structure", "plan", "sections"],
    cta: "Build outline",
    hidden: true,
  },
  {
    name: "Humanizer Tool",
    description: "Make AI text sound more natural and human.",
    href: "/tools/humanizer-tool",
    icon: LuGraduationCap,
    badge: "New",
    category: "essay-writing",
    group: "originality",
    keywords: ["humanize", "rewrite", "natural", "bypass ai", "undetectable"],
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
    group: "originality",
    keywords: ["ai detection", "detector", "turnitin", "gptzero", "ai score"],
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
    group: "originality",
    keywords: ["plagiarism", "originality", "copied", "similarity", "turnitin"],
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
    group: "writer-lab",
    keywords: ["grammar", "spelling", "punctuation", "proofread", "clarity"],
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
    group: "writer-lab",
    keywords: ["thesis", "statement", "argument", "claim"],
    cta: "Build thesis",
    hidden: true,
  },
  {
    name: "Research Question Generator",
    description: "Find clear, specific research questions fast.",
    href: "/tools/research-question",
    icon: FiSearch,
    badge: "Free",
    category: "research",
    group: "writer-lab",
    keywords: ["research question", "rq", "inquiry", "topic"],
    cta: "Generate question",
  },
  {
    name: "Academic Research Assistant",
    description: "Draft, rewrite, and improve with one focused editor.",
    href: "/tools/academic-research-assistant",
    icon: FiFileText,
    badge: "Popular",
    category: "research",
    group: "writer-lab",
    keywords: ["editor", "draft", "research", "write", "document"],
    cta: "Start research",
    hidden: true,
  },
  {
    name: "Citation Generator",
    description: "Create citations that look clean and consistent.",
    href: "/tools/citation-tool",
    icon: RiDoubleQuotesL,
    badge: "Popular",
    category: "research",
    group: "writer-lab",
    keywords: ["citation", "reference", "bibliography", "apa", "mla", "harvard"],
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
    group: "study-lab",
    keywords: ["math", "equation", "algebra", "solve", "steps"],
    cta: "Solve equation",
  },
];

/** The tools users can browse to: the dashboard grid and the sidebar. */
export const VISIBLE_TOOLS = TOOLS.filter((tool) => !tool.hidden);

export type { ToolCardData, ToolCategory, ToolGroup };
