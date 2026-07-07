import { NextRequest } from "next/server";
import { generateArtifact } from "@/app/lib/server/study/generate";
import {
  getSession,
  getSessionSourceText,
  listArtifacts,
  upsertArtifact,
} from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import { cleanSourceText } from "@/app/lib/server/study/documentClean";
import { GeminiConfigError } from "@/app/lib/server/ai/gemini";
import {
  StudyArtifactType,
  StudyLearningMode,
} from "@/app/lib/server/study/types";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set<StudyArtifactType>([
  "notes",
  "summary",
  "flashcards",
  "quizzes",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; type: string } },
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

    const type = params.type as StudyArtifactType;
    if (!ALLOWED_TYPES.has(type)) {
      return fail("Unsupported generation type");
    }

    const { mergedText: storedText } = await getSessionSourceText(params.id);
    // Defense in depth: sources ingested before the shared cleaner existed (or
    // via any legacy path) may still hold ToC/cover boilerplate — clean again at
    // generation time so regenerating an OLD session also produces clean output.
    const mergedText = cleanSourceText(storedText);
    if (!mergedText.trim()) {
      return fail("No source text found for this session");
    }

    let body: { mode?: StudyLearningMode; examTopics?: string[] } = {};
    const rawBody = await request.text();
    if (rawBody.trim()) {
      try {
        body = JSON.parse(rawBody) as typeof body;
      } catch {
        return fail("Invalid JSON body");
      }
    }

    const mode =
      body.mode === "exam" || body.mode === "quiz" || body.mode === "research"
        ? body.mode
        : "research";
    const examTopics = Array.isArray(body.examTopics)
      ? body.examTopics.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : [];

    // If an artifact of this type already exists, the user is REGENERATING —
    // pass the previous content so generation produces a substantially
    // different version instead of a near-identical repeat. Best-effort: a
    // lookup failure must not block generation.
    let previousContent: unknown;
    try {
      // The repo returns raw documents whose static type only guarantees ids;
      // artifacts always carry `type` + `content` (see upsertArtifact).
      const artifacts = (await listArtifacts(params.id)) as Array<{
        type?: StudyArtifactType;
        content?: unknown;
      }>;
      previousContent = artifacts.find((a) => a.type === type)?.content;
    } catch (error) {
      console.error("study.generate.previous_lookup_failed", error);
    }

    const { content } = await generateArtifact(type, mergedText, {
      mode,
      examTopics,
      previousContent,
    });
    // Generation is always live AI now (no offline stub), so a returned result
    // is a real one — persist it. On regeneration this overwrites the previous
    // version with the fresh output.
    await upsertArtifact(params.id, type, content);

    return ok({ type, content });
  } catch (error) {
    console.error("study.generate.POST", error);
    // A missing/rejected Gemini key is a server misconfiguration; report it
    // distinctly (503) so it isn't confused with a transient generation error
    // and so the deploy gets fixed instead of silently serving stale output.
    if (error instanceof GeminiConfigError) {
      return fail(
        "AI is not configured on the server (missing or invalid GEMINI_API_KEY). Please set it and restart the app.",
        503,
      );
    }
    return fail("Failed to generate artifact", 500);
  }
}
