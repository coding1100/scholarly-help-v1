import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/app/lib/mongodb";
import {
  generateGeminiText,
  GeminiConfigError,
} from "@/app/lib/server/ai/gemini";
import { embedQuery } from "@/app/lib/server/rag/embedders/gemini";

export const dynamic = "force-dynamic";

/**
 * Operational health/diagnostic for the Study AI stack. Answers, in ONE call,
 * the question this app kept getting wrong: "is the LLM actually reachable, or
 * are we silently serving the deterministic fallback?"
 *
 * Reports only booleans, model names, and error MESSAGES — never key values —
 * so it is safe to hit in production. It is gated behind a token to avoid
 * exposing internal error text publicly: pass ?token=<STUDY_HEALTH_TOKEN>
 * (or header x-health-token). If STUDY_HEALTH_TOKEN is unset, the endpoint is
 * disabled (returns 404-like) so it can't be probed by default.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.STUDY_HEALTH_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  const provided =
    request.nextUrl.searchParams.get("token") ||
    request.headers.get("x-health-token") ||
    "";
  if (provided !== expected) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const report: Record<string, unknown> = {
    env: {
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY?.trim()),
      DATABASE_URL: Boolean(process.env.DATABASE_URL?.trim()),
      GEMINI_MODEL:
        process.env.GEMINI_MODEL_ID ||
        process.env.GEMINI_MODEL ||
        "gemini-2.5-flash (default)",
      GEMINI_EMBED_MODEL:
        process.env.GEMINI_EMBED_MODEL || "gemini-embedding-2 (default)",
    },
  };

  // 1) Mongo reachability.
  try {
    const db = await getMongoDb();
    report.mongo = { ok: Boolean(db) };
  } catch (error) {
    report.mongo = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // 2) Gemini text generation — the summary/tutor path.
  try {
    const text = await generateGeminiText({
      systemInstruction: "You are a health probe.",
      userPrompt: 'Reply with exactly the word: OK',
      temperature: 0,
      maxOutputTokens: 16,
    });
    report.geminiGenerate = { ok: true, sample: text.slice(0, 40) };
  } catch (error) {
    report.geminiGenerate = {
      ok: false,
      configError: error instanceof GeminiConfigError,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // 3) Gemini embeddings — the RAG indexing/retrieval path.
  try {
    const vector = await embedQuery("health probe");
    report.geminiEmbed = { ok: vector.length > 0, dimensions: vector.length };
  } catch (error) {
    report.geminiEmbed = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const healthy =
    (report.mongo as { ok?: boolean })?.ok === true &&
    (report.geminiGenerate as { ok?: boolean })?.ok === true &&
    (report.geminiEmbed as { ok?: boolean })?.ok === true;

  return NextResponse.json(
    { success: true, healthy, report },
    { status: healthy ? 200 : 503 },
  );
}
