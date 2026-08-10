type RateWindow = { count: number; resetAt: number };

const globalRateLimits = globalThis as typeof globalThis & {
  __studyAiRateLimits?: Map<string, RateWindow>;
};

const windows =
  globalRateLimits.__studyAiRateLimits ||
  (globalRateLimits.__studyAiRateLimits = new Map<string, RateWindow>());

export function consumeStudyAiQuota(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = windows.get(input.key);
  if (!current || current.resetAt <= now) {
    windows.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= input.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
