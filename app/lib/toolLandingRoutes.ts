const TOOL_LANDING_DESTINATIONS: Readonly<Record<string, string>> = {
  "/tools/ai-academic-research": "/tools/academic-research-assistant",
  "/tools/ai-course-planner": "/tools/course-planner",
  "/tools/ai-detector": "/tools/ai-detector-tool",
  "/tools/ai-essay-generator": "/tools/essay-generator",
  "/tools/ai-essay-title-generator": "/tools/essay-title",
  "/tools/ai-grammar-check": "/tools/grammar-checker",
  "/tools/ai-humanizer": "/tools/humanizer-tool",
  "/tools/ai-math-solver": "/tools/math-solver",
  "/tools/ai-paraphraser": "/tools/paraphraser-tool",
  "/tools/ai-study-workspace": "/tools/study-workspace",
  "/tools/ai-summarizer": "/tools/summarizer-tool",
  "/tools/ai-thesis-generator": "/tools/thesis-generator-tool",
  "/tools/ai-thesis-statement-generator": "/tools/thesis-generator-tool",
  "/tools/citation-generator": "/tools/citation-tool",
  "/tools/essay-title-generator": "/tools/essay-title",
  "/tools/research-question-generator": "/tools/research-question",
};

/** Open the current landing page's tool, or use the default dashboard. */
export function getToolDashboardHref(pathname: string | null): string {
  const normalizedPath = pathname?.replace(/\/+$/, "") ?? "";
  return TOOL_LANDING_DESTINATIONS[normalizedPath] ?? "/tools/dashboard";
}
