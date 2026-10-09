import { TOOLS } from "@/app/components/AiTools/Dashboard/toolsData";
import type { PickToolItem } from "@/app/components/MainToolLanding/pickTabUtils";
import { TOOL_LANDING_DESTINATIONS } from "./toolLandingRoutes";

const HIDDEN_TOOLS = TOOLS.filter((tool) => tool.hidden);
const HIDDEN_TOOL_PATHS = new Set(HIDDEN_TOOLS.map((tool) => tool.href));
const HIDDEN_TOOL_NAMES = new Set(HIDDEN_TOOLS.map((tool) => tool.name));

/**
 * True when a link (relative or absolute) points at a hidden tool, either its
 * workspace or its landing page.
 */
export function isHiddenToolLink(link: string): boolean {
  let path: string;
  try {
    path = new URL(link, "https://scholarlyhelp.com").pathname;
  } catch {
    return false;
  }
  path = path.replace(/\/+$/, "");
  return HIDDEN_TOOL_PATHS.has(TOOL_LANDING_DESTINATIONS[path] ?? path);
}

/**
 * The /tools page's pick section with hidden tools left out (the "Show all"
 * count follows). Applied at render, not in the admin merge, so the admin
 * editor still sees and saves the hidden tools' cards. Cards are matched by
 * link or by name, since admin-edited links can be mistyped.
 */
export function withoutHiddenPickTools<
  T extends {
    tools: PickToolItem[];
    tabTools?: Record<string, PickToolItem[]>;
    showAllButtonText?: string;
  },
>(pickSection: T): T {
  const visible = (tool: PickToolItem) =>
    !isHiddenToolLink(tool.link) && !HIDDEN_TOOL_NAMES.has(tool.heading);
  const tools = pickSection.tools.filter(visible);
  return {
    ...pickSection,
    tools,
    tabTools: pickSection.tabTools
      ? Object.fromEntries(
          Object.entries(pickSection.tabTools).map(([slug, items]) => [
            slug,
            items.filter(visible),
          ]),
        )
      : pickSection.tabTools,
    showAllButtonText: `Show all ${tools.length} tools`,
  };
}
