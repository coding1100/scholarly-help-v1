export type ToolsSheetGenerateEventDetail = {
  toolName?: string;
  action?: string;
};

const EVENT_NAME = "sh:toolssheet-generate";
const ANONYMOUS_ID_KEY = "sh_tool_usage_anonymous_id_v1";

function getOrCreateAnonymousId(): string {
  try {
    const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(ANONYMOUS_ID_KEY, next);
    return next;
  } catch {
    return "anonymous";
  }
}

function getDeviceLabel() {
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

function postUsageEvent(detail: ToolsSheetGenerateEventDetail) {
  const toolName = (detail.toolName || "").trim();
  if (!toolName) return;

  const payload = {
    toolName,
    action: detail.action || "generate",
    userId: window.localStorage.getItem("user_id") || undefined,
    userEmail: window.localStorage.getItem("user_email") || undefined,
    userName: window.localStorage.getItem("user_name") || undefined,
    anonymousId: getOrCreateAnonymousId(),
    path: window.location.pathname,
    search: window.location.search,
    href: window.location.href,
    referrer: document.referrer || undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    language: navigator.language || undefined,
    device: getDeviceLabel(),
  };

  void fetch("/api/tool-usage/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Tracking must never block the tool result UX.
  });
}

/**
 * Call this when the user clicks the "Generate" button in any tool.
 * `MTSidebar` listens for this event and will post to `/api/toolssheet/` once per fbclid.
 */
export function trackToolGenerate(detail: ToolsSheetGenerateEventDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  postUsageEvent(detail);
}

export const __TOOLS_SHEET_EVENT_NAME__ = EVENT_NAME;

