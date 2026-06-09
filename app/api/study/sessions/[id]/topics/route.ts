import { NextRequest } from "next/server";
import { extractTopicCandidates } from "@/app/lib/server/study/sourcePriority";
import { getSession, getSessionSourceText } from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const session = await getSession(params.id);
    if (!session) {
      return fail("Session not found", 404);
    }
    if (session.userId !== userId) {
      return fail("Forbidden", 403);
    }

    const { mergedText } = await getSessionSourceText(params.id);
    const topics = extractTopicCandidates(mergedText);

    return ok({ topics });
  } catch (error) {
    console.error("study.topics.GET", error);
    return fail("Failed to extract topics", 500);
  }
}
