export type PickToolItem = {
  iconKey: string;
  tag: string;
  heading: string;
  description: string;
  buttonText: string;
  link: string;
};

export const PICK_TAB_SLUGS: Record<string, string> = {
  "Essay writing": "essay-writing",
  Research: "research",
  Citations: "citations",
  "Math & Science": "math-science",
  "Study tools": "study-tools",
};

export function getPickTabSlug(tab: string) {
  if (tab === "All tools") return "all-tools";
  return PICK_TAB_SLUGS[tab] || tab.toLowerCase().replace(/\s+/g, "-");
}

export function duplicatePickTools(tools: PickToolItem[]): PickToolItem[] {
  return tools.map((tool) => ({ ...tool }));
}

export function buildDefaultTabTools(
  allTools: PickToolItem[],
): Record<string, PickToolItem[]> {
  return Object.fromEntries(
    Object.values(PICK_TAB_SLUGS).map((slug) => [
      slug,
      duplicatePickTools(allTools),
    ]),
  );
}

export function getPickToolsForTab(
  pickSection: {
    tools: PickToolItem[];
    tabTools?: Record<string, PickToolItem[]>;
  },
  tab: string,
): PickToolItem[] {
  if (tab === "All tools") return pickSection.tools;

  const slug = getPickTabSlug(tab);
  const tabTools = pickSection.tabTools?.[slug];
  if (Array.isArray(tabTools) && tabTools.length > 0) return tabTools;

  return pickSection.tools;
}
