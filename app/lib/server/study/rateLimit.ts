type RateWindow = { count: number; resetAt: number };

const globalRateLimits = globalThis as typeof globalThis & {
  __studyAiRateLimits?: Map<string, RateWindow>;
};

const windows =
  globalRateLimits.__studyAiRateLimits ||
  (globalRateLimits.__studyAiRateLimits = new Map<string, RateWindow>());

function currentWindow(key: string, now: number, windowMs: number): RateWindow {
  const existing = windows.get(key);
  if (existing && existing.resetAt > now) return existing;
  const fresh = { count: 0, resetAt: now + windowMs };
  windows.set(key, fresh);
  return fresh;
}

/**
 * Counts one AI call against `key`, and also against `ip` when given. Guest ids
 * are minted client-side, so guests also need a cap shared by their client IP;
 * otherwise a new x-user-id would reset the limit. A call is only counted when
 * every window still has room.
 */
export function consumeStudyAiQuota(input: {
  key: string;
  limit: number;
  windowMs: number;
  ip?: { key: string; limit: number } | null;
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const checks = [{ key: input.key, limit: input.limit }];
  if (input.ip) checks.push(input.ip);
  const tracked = checks.map((check) => ({
    limit: check.limit,
    window: currentWindow(check.key, now, input.windowMs),
  }));

  const exhausted = tracked.filter(({ limit, window }) => window.count >= limit);
  if (exhausted.length > 0) {
    const resetAt = Math.max(...exhausted.map(({ window }) => window.resetAt));
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }
  for (const { window } of tracked) window.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
