import { TOOLS } from "./Dashboard/toolsData";

/**
 * Page titles for the tools header.
 *
 * Curated labels win, then the tool registry fills in everything else. Before
 * this, the header ran a hand-maintained if/else chain that ended in `""`, so
 * any route nobody remembered to add — the Humanizer, AI Detector, Grammar
 * Checker and half a dozen more — rendered a blank bar.
 */
const CURATED_TITLES: Record<string, string> = {
  "/tools/dashboard": "Study Hub",
  "/tools/recent-work": "Recent work",
  "/tools/account": "Account & billing",
  "/tools/paraphraser-tool": "AI Paraphraser",
  "/tools/summarizer-tool": "AI Summarizer",
  "/tools/thesis-generator-tool": "AI Thesis Statement Generator",
  "/tools/essay-outline-tool": "AI Essay Outline",
  "/tools/essay-title": "AI Essay Title Generator",
  "/tools/research-question": "AI Research Question Generator",
  "/tools/math-solver": "Math Solver",
  "/tools/citation-tool": "AI Citation",
  "/tools/tutor": "AI Tutor",
  "/tools/exam-prep": "AI Exam Prep",
  "/tools/micro-learning": "AI Micro Learning",
  "/tools/language-practice": "AI Language Practice",
  "/tools/study-workspace": "AI Study Workspace",
  "/tools/cgpa-calculator": "CGPA Calculator",
  "/tools/plagiarism-checker": "Plagiarism Checker",
};

/** Trailing slashes vary by route; compare without one. */
export function normalizeToolPath(pathname: string | null | undefined): string {
  if (!pathname) return "";
  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

export function resolveToolTitle(pathname: string | null | undefined): string {
  const path = normalizeToolPath(pathname);
  if (!path) return "";
  if (CURATED_TITLES[path]) return CURATED_TITLES[path];

  const exact = TOOLS.find((tool) => tool.href === path);
  if (exact) return exact.name;

  // Nested tool routes (e.g. a session id appended to a tool) keep the tool's
  // own title rather than falling back to a blank bar.
  const nested = TOOLS.find((tool) => path.startsWith(`${tool.href}/`));
  return nested?.name ?? "";
}
