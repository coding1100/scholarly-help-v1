export type VerifiedUser = {
  userId: string;
  email?: string;
  name?: string;
};

type VerifiedUserPayload = {
  user_id?: unknown;
  email?: unknown;
  name?: unknown;
};

type VerifyTokenBody = {
  valid?: boolean;
  user?: VerifiedUserPayload;
};

function authApiBaseUrl(): string {
  return String(
    process.env.AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_NGROX_URL ||
      "",
  ).replace(/\/$/, "");
}

function optionalString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

/**
 * Resolves a user access token to the account it belongs to by asking the
 * backend that issued it. Returns null for a missing, invalid or expired token,
 * and when the backend cannot be reached, so callers treat the request as a
 * guest rather than trusting identity fields the browser sent.
 */
export async function verifyUserAccessToken(
  token: string,
  timeoutMs = 3_000,
): Promise<VerifiedUser | null> {
  const apiBase = authApiBaseUrl();
  if (!apiBase) {
    console.error("verifyUserAccessToken: AUTH_API_BASE_URL is not configured");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBase}/auth/verify-token`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const raw = await response.json();
    // The backend wraps every response as { success, message, data }.
    const body: VerifyTokenBody | undefined = raw?.data ?? raw;
    if (body?.valid !== true) return null;

    const userId = optionalString(body.user?.user_id, 120);
    if (!userId) return null;
    return {
      userId,
      email: optionalString(body.user?.email, 254)?.toLowerCase(),
      name: optionalString(body.user?.name, 160),
    };
  } catch (error) {
    console.error(
      "verifyUserAccessToken: verification service unavailable",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
