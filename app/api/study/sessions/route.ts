import { NextRequest } from "next/server";
import { createSession, listSessions } from "@/app/lib/server/study/repo";
import {
  fail,
  getAuthenticatedUserId,
  ok,
} from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const sessions = await listSessions(userId);
    return ok(sessions);
  } catch (error) {
    console.error("study.sessions.GET", error);
    return fail("Failed to list sessions", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title?: string };
    const title = (body?.title || "").trim();
    if (!title) {
      return fail("title is required");
    }

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const session = await createSession(userId, title);
    return ok(session, 201);
  } catch (error) {
    console.error("study.sessions.POST", error);
    return fail("Failed to create session", 500);
  }
}
