import { NextRequest } from "next/server";
import {
  deleteSession,
  getSession,
  listArtifacts,
  listSources,
  listTutorMessages,
  updateSessionTitle,
  updateSessionTutorState,
} from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getAuthenticatedUserId(request);
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
    const [artifacts, tutorMessages, sources] = await Promise.all([
      listArtifacts(params.id),
      listTutorMessages(params.id),
      listSources(params.id),
    ]);

    return ok({
      session,
      sources,
      artifacts,
      tutorMessages,
    });
  } catch (error) {
    console.error("study.session.GET", error);
    return fail("Failed to fetch session", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const existingSession = await getSession(params.id);
    if (!existingSession) {
      return fail("Session not found", 404);
    }
    if (existingSession.userId !== userId) {
      return fail("Forbidden", 403);
    }

    const body = (await request.json()) as {
      title?: string;
      tutorState?: Record<string, unknown>;
    };
    if (body.tutorState && typeof body.tutorState === "object") {
      const encoded = JSON.stringify(body.tutorState);
      if (encoded.length > 200_000) return fail("Tutor state is too large");
      const session = await updateSessionTutorState(params.id, body.tutorState);
      if (!session) return fail("Session not found", 404);
      return ok({ session });
    }
    const title = (body?.title || "").trim();
    if (!title) {
      return fail("title is required");
    }

    const session = await updateSessionTitle(params.id, title);
    if (!session) return fail("Session not found", 404);

    return ok({ session });
  } catch (error) {
    console.error("study.session.PATCH", error);
    return fail("Failed to update session", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const existingSession = await getSession(params.id);
    if (!existingSession) {
      return fail("Session not found", 404);
    }
    if (existingSession.userId !== userId) {
      return fail("Forbidden", 403);
    }

    const deleted = await deleteSession(params.id);
    if (!deleted) {
      return fail("Session not found", 404);
    }
    return ok({ deleted: true });
  } catch (error) {
    console.error("study.session.DELETE", error);
    return fail("Failed to delete session", 500);
  }
}
