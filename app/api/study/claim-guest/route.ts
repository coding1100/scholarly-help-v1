import { NextRequest } from "next/server";
import { claimGuestSessions } from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";

/**
 * Migrate a guest's study work onto the account they just created.
 * The real user id is taken from the verified auth token (Authorization
 * header); the guest id is supplied in the body. No-op if they match.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      guestUserId?: string;
    };
    const guestUserId = (body?.guestUserId || "").trim();
    if (!guestUserId) {
      return fail("guestUserId is required");
    }
    // Only honour guest ids minted by the client to avoid arbitrary re-keying.
    if (!guestUserId.startsWith("guest_")) {
      return ok({ migrated: 0 });
    }

    const realUserId = getAuthenticatedUserId(request);
    if (!realUserId) {
      return fail("Unauthorized", 401);
    }

    const migrated = await claimGuestSessions(guestUserId, realUserId);
    return ok({ migrated });
  } catch (error) {
    console.error("study.claim-guest.POST", error);
    return fail("Failed to migrate guest sessions", 500);
  }
}
