/** Every tool landing page, for the "More free writing tools" links. */
export const LANDING_PAGES = {
  humanizer: {
    name: "AI Humanizer",
    description: "Make a stiff draft sound natural.",
    href: "/tools/ai-humanizer",
  },
  paraphraser: {
    name: "AI Paraphraser",
    description: "Restate a passage in new words.",
    href: "/tools/ai-paraphraser",
  },
  grammar: {
    name: "Grammar Checker",
    description: "Fix mistakes, with a reason for each.",
    href: "/tools/ai-grammar-check",
  },
  essay: {
    name: "Essay Generator",
    description: "Go from a topic to a full draft.",
    href: "/tools/ai-essay-generator",
  },
  detector: {
    name: "AI Detector",
    description: "See which sentences read as AI.",
    href: "/tools/ai-detector",
  },
  math: {
    name: "Math Solver",
    description: "Step-by-step math explanations.",
    href: "/tools/ai-math-solver",
  },
  study: {
    name: "AI Study Workspace",
    description: "Notes, flashcards and quizzes.",
    href: "/tools/ai-study-workspace",
  },
  citation: {
    name: "Citation Generator",
    description: "APA, MLA, Harvard and Chicago.",
    href: "/tools/citation-generator",
  },
  researchQuestion: {
    name: "Research Question Generator",
    description: "Find a focused research question.",
    href: "/tools/research-question-generator",
  },
  coursePlanner: {
    name: "Course Planner",
    description: "Map out your semester.",
    href: "/tools/ai-course-planner",
  },
} as const;

export type LandingPageKey = keyof typeof LANDING_PAGES;
