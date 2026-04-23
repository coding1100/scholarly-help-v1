export type FbclidToolVisit = {
  tool_name: string;
  path: string;
};

export type FbclidTrackingState = {
  fbclid?: string;
  user_name?: string;
  user_id?: string;
  user_email?: string;
  current_path?: string;
  current_active_tool?: string;
  tool_visits?: FbclidToolVisit[]; // unique by path
};

const STORAGE_KEY = "sh_fbclid_tracking_v1";

function readState(): FbclidTrackingState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as FbclidTrackingState;
  } catch {
    return {};
  }
}

function writeState(next: FbclidTrackingState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / disabled storage
  }
}

export function upsertFbclidToolContext(input: {
  fbclid: string;
  user_name?: string;
  user_id?: string;
  user_email?: string;
  current_path: string;
  current_active_tool: string;
}) {
  const prev = readState();

  const prevVisits = Array.isArray(prev.tool_visits) ? prev.tool_visits : [];
  const nextVisits = prevVisits.some((v) => v?.path === input.current_path)
    ? prevVisits
    : [
        ...prevVisits,
        { tool_name: input.current_active_tool, path: input.current_path },
      ];

  const next: FbclidTrackingState = {
    ...prev,
    fbclid: prev.fbclid || input.fbclid, // keep first fbclid seen
    user_name: input.user_name ?? prev.user_name,
    user_id: input.user_id ?? prev.user_id,
    user_email: input.user_email ?? prev.user_email,
    current_path: input.current_path,
    current_active_tool: input.current_active_tool,
    tool_visits: nextVisits,
  };

  writeState(next);
  // eslint-disable-next-line no-console
  console.log("[fbclid-tracking]", next);
}

