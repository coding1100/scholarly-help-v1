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
  "Math & Science": "math-science",
  "Study tools": "study-tools",
};

export function getPickTabSlug(tab: string) {
  if (tab === "All tools") return "all-tools";
  return PICK_TAB_SLUGS[tab] || tab.toLowerCase().replace(/\s+/g, "-");
}

export function flattenPickTools(
  tabTools: Record<string, PickToolItem[]>,
): PickToolItem[] {
  const allTools: PickToolItem[] = [];
  const seen = new Set<string>();

  for (const slug of Object.values(PICK_TAB_SLUGS)) {
    for (const tool of tabTools[slug] || []) {
      if (!seen.has(tool.heading)) {
        seen.add(tool.heading);
        allTools.push({ ...tool });
      }
    }
  }

  return allTools;
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

  return [];
}
