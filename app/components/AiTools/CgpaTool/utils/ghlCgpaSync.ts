import type { CgpaGhlSnapshot } from "./cgpaGhlSnapshot";

type CgpaGhlResponse = {
  success?: boolean;
  message?: string;
};

/**
 * Upserts the contact in GHL with final CGPA (server route; token stays server-side).
 * When failures should block the UI, check the return value.
 */
export async function syncCgpaToGhl({
  email,
  cgpa,
  snapshot,
}: {
  email: string;
  cgpa: string;
  snapshot: CgpaGhlSnapshot;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch("/api/cgpa-ghl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, cgpa, snapshot }),
    });
    console.log("whole data", { email, cgpa, snapshot });
  } catch {
    return { ok: false, message: "Network error calling GHL sync" };
  }

  let data: CgpaGhlResponse = {};
  try {
    data = (await res.json()) as CgpaGhlResponse;
  } catch {
    data = {};
  }

  if (!res.ok) {
    return {
      ok: false,
      message: data?.message || `GHL sync failed (${res.status})`,
    };
  }

  return { ok: true };
}
