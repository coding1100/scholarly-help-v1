import { TOOLS } from "./toolsData";
import type { ToolCardData, ToolGroup } from "./ToolCard";

/**
 * The Study Hub's three groups, in the order the dashboard and the sidebar
 * both render them.
 */
export const TOOL_GROUPS: Array<{ key: ToolGroup; label: string }> = [
  { key: "originality", label: "Originality" },
  { key: "study-lab", label: "Study Lab" },
  { key: "writer-lab", label: "Writer Lab" },
];

/**
 * Tools that lead each group, in the order the design shows them. Anything
 * not listed keeps its registry order after these. Keyed by href so a display
 * rename can never silently drop a tool out of its intended position.
 */
const GROUP_LEAD_ORDER: Record<ToolGroup, string[]> = {
  originality: [
    "/tools/ai-detector-tool",
    "/tools/humanizer-tool",
    "/tools/paraphraser-tool",
    "/tools/plagiarism-checker",
  ],
  "study-lab": [
    "/tools/tutor",
    "/tools/math-solver",
    "/tools/cgpa-calculator",
    "/tools/study-workspace",
  ],
  "writer-lab": [
    "/tools/essay-studio",
    "/tools/essay-generator",
    "/tools/citation-tool",
    "/tools/grammar-checker",
    "/tools/essay-grader",
  ],
};

function orderWithinGroup(group: ToolGroup, tools: ToolCardData[]) {
  const lead = GROUP_LEAD_ORDER[group] || [];
  const rank = (tool: ToolCardData) => {
    const index = lead.indexOf(tool.href);
    return index === -1 ? lead.length : index;
  };
  return [...tools].sort((a, b) => rank(a) - rank(b));
}

export function groupedTools(): Array<{
  key: ToolGroup;
  label: string;
  tools: ToolCardData[];
}> {
  return TOOL_GROUPS.map((group) => ({
    ...group,
    tools: orderWithinGroup(
      group.key,
      TOOLS.filter((tool) => tool.group === group.key),
    ),
  }));
}

/**
 * The four cards in the dashboard's "Top tools" strip. Resolved from the
 * registry rather than redeclared, so a tool that is renamed, re-routed or
 * removed can never leave a dead card behind.
 */
const TOP_TOOL_HREFS = [
  "/tools/ai-detector-tool",
  "/tools/tutor",
  "/tools/plagiarism-checker",
  "/tools/essay-studio",
];

export const TOP_TOOLS: ToolCardData[] = TOP_TOOL_HREFS.map((href) =>
  TOOLS.find((tool) => tool.href === href),
).filter((tool): tool is ToolCardData => Boolean(tool));

/** Case-insensitive match over name, description and keywords. */
export function matchesQuery(tool: ToolCardData, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [tool.name, tool.description || "", ...(tool.keywords || [])]
    .join(" ")
    .toLowerCase();
  return needle
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}
