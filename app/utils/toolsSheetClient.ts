export type ToolsSheetGenerateEventDetail = {
  toolName?: string;
};

const EVENT_NAME = "sh:toolssheet-generate";

/**
 * Call this when the user clicks the "Generate" button in any tool.
 * `MTSidebar` listens for this event and will post to `/api/toolssheet/` once per fbclid.
 */
export function trackToolGenerate(detail: ToolsSheetGenerateEventDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

export const __TOOLS_SHEET_EVENT_NAME__ = EVENT_NAME;

