import {
  fetchWithAuthRetry,
  getOrRefreshAccessToken,
} from "@/app/lib/authSession";

export type TokenUsageSnapshot = {
  totalTokens: number;
  usedTokens: number;
  availableCredits: number | null;
  paidPlan: boolean;
  loading: boolean;
  lastUpdatedAt: number | null;
};

type Listener = (snapshot: TokenUsageSnapshot) => void;

const DEFAULT_SNAPSHOT: TokenUsageSnapshot = {
  totalTokens: 0,
  usedTokens: 0,
  availableCredits: null,
  paidPlan: false,
  loading: false,
  lastUpdatedAt: null,
};

let snapshot: TokenUsageSnapshot = DEFAULT_SNAPSHOT;
const listeners = new Set<Listener>();

let initialized = false;
let accountEpoch = 0;
let authEventsInstalled = false;

function installAuthEvents() {
  if (authEventsInstalled || typeof window === "undefined") return;
  authEventsInstalled = true;
  const reset = () => {
    accountEpoch++;
    inFlight = null;
    snapshot = { ...DEFAULT_SNAPSHOT };
    emit();
  };
  window.addEventListener("sh:auth-session-changed", reset);
  window.addEventListener("sh:session-expired", reset);
  window.addEventListener("sh:auth-cleared", reset);
  window.addEventListener("billing:confirmed", () =>
    requestTokenUsageRefresh(0),
  );
  window.addEventListener("focus", () => requestTokenUsageRefresh(0));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestTokenUsageRefresh(0);
  });
}
let inFlight: Promise<void> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let autoRefreshTimers: Array<ReturnType<typeof setTimeout>> = [];
export const __TOKEN_USAGE_UNAUTHORIZED_EVENT__ = "sh:token-usage-unauthorized";

function emit() {
  for (const l of listeners) l(snapshot);
}

function setSnapshot(patch: Partial<TokenUsageSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

async function fetchTokenUsage(accessToken: string): Promise<{
  total_tokens: number;
  usedTokens: number;
  availableCredits: number | null;
  paidPlan: boolean;
}> {
  const base = process.env.NEXT_PUBLIC_NGROX_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_NGROX_URL");

  const res = await fetchWithAuthRetry(`${base}/users/token-usage`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`token-usage failed: ${res.status} ${text}`);
    (err as any).status = res.status;
    throw err;
  }

  const raw = (await res.json()) as any;
  // Backend wraps responses as { success, message, data }
  const data = raw?.data ?? raw;
  return {
    total_tokens: Number(data?.total_tokens ?? 0),
    usedTokens: Number(data?.usedTokens ?? 0),
    availableCredits:
      typeof data?.tokens_remaining === "number" &&
      Number.isFinite(data.tokens_remaining)
        ? Math.max(0, data.tokens_remaining)
        : null,
    paidPlan: data?.plan === "Premium",
  };
}

export function subscribeTokenUsage(listener: Listener) {
  installAuthEvents();
  listeners.add(listener);
  // push current snapshot immediately
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

export function getTokenUsageSnapshot() {
  return snapshot;
}

export async function refreshTokenUsageNow(opts?: {
  defaultTotalTokens?: number;
}) {
  if (typeof window === "undefined") return;

  installAuthEvents();
  const accessToken = await getOrRefreshAccessToken();
  if (!accessToken) return;

  if (inFlight) return inFlight;
  const epoch = accountEpoch;

  inFlight = (async () => {
    setSnapshot({ loading: true });
    try {
      const { total_tokens, usedTokens, availableCredits, paidPlan } =
        await fetchTokenUsage(accessToken);
      if (epoch !== accountEpoch) return;
      setSnapshot({
        totalTokens: total_tokens,
        availableCredits,
        paidPlan,
        usedTokens,
        loading: false,
        lastUpdatedAt: Date.now(),
      });
      try {
        window.localStorage.setItem("totalTokens", String(total_tokens));
      } catch {
        // ignore
      }
    } catch (e: any) {
      if (epoch !== accountEpoch) return;
      if (e?.status === 401 && typeof window !== "undefined") {
        try {
          window.dispatchEvent(
            new CustomEvent(__TOKEN_USAGE_UNAUTHORIZED_EVENT__),
          );
        } catch {
          // ignore
        }
      }
      setSnapshot({ loading: false, availableCredits: null });
      throw e;
    } finally {
      if (epoch === accountEpoch) inFlight = null;
    }
  })();

  return inFlight;
}

export function requestTokenUsageRefresh(delayMs = 600) {
  if (typeof window === "undefined") return;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void refreshTokenUsageNow().catch(() => {
      // ignored; callers handle auth redirects elsewhere
    });
  }, delayMs);
}

/**
 * One-time init: auto-refresh token usage after tool "Generate" events.
 * Tools already dispatch `sh:toolssheet-generate` via `trackToolGenerate`.
 */
export function initTokenUsageAutoRefresh(toolGenerateEventName: string) {
  if (initialized) return;
  initialized = true;
  if (typeof window === "undefined") return;

  const clearAutoRefreshTimers = () => {
    for (const timer of autoRefreshTimers) {
      clearTimeout(timer);
    }
    autoRefreshTimers = [];
  };

  const scheduleAutoRefreshSequence = () => {
    // Some tools dispatch the "generate" event before API completion.
    // Use staged retries so the token bar updates after backend usage settles.
    clearAutoRefreshTimers();
    const delays = [800, 2200, 4500];
    autoRefreshTimers = delays.map((delayMs) =>
      setTimeout(() => {
        void refreshTokenUsageNow().catch(() => {
          // ignored; callers handle auth redirects elsewhere
        });
      }, delayMs),
    );
  };

  window.addEventListener(toolGenerateEventName, () => {
    scheduleAutoRefreshSequence();
  });
}
