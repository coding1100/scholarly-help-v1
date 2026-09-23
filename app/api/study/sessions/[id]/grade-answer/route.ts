import { NextRequest } from "next/server";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import { getSession } from "@/app/lib/server/study/repo";
import { generateGeminiText, GeminiConfigError } from "@/app/lib/server/ai/gemini";
import { consumeStudyAiQuota } from "@/app/lib/server/study/rateLimit";
import { parseJson } from "@/app/lib/server/study/generate";

export const dynamic = "force-dynamic";

/**
 * Grades one short-answer quiz response against the model answer. Plain
 * string equality (used before this route existed) marks "The cytoplasm"
 * wrong against a model answer of "Cytoplasm" — any article, synonym, or
 * rephrasing fails a genuinely correct answer. This asks Gemini instead,
 * scoped to a single question so it's cheap and fast (small prompt/output,
 * same rate limiter tier as an action chip, no separate billing reservation
 * — it rides on the quiz generation the student already paid for).
 */

function gradingSystemInstruction(): string {
  return [
    "You grade ONE student short-answer quiz response against a model answer.",
    "Be lenient: accept synonyms, rephrasing, missing articles, minor spelling slips,",
    "and partial-credit-worthy answers that capture the key idea, even if not word-for-word.",
    "Only mark it wrong if the core concept is actually incorrect or missing.",
    "Return valid JSON only, no markdown fences.",
  ].join(" ");
}

function gradingUserPrompt(input: {
  question: string;
  modelAnswer: string;
  studentAnswer: string;
}): string {
  return [
    'Return: { "correct": boolean, "feedback": "one short sentence" }',
    "",
    `QUESTION: ${input.question}`,
    `MODEL ANSWER: ${input.modelAnswer}`,
    `STUDENT ANSWER: ${input.studentAnswer}`,
  ].join("\n");
}

export async function POST(
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

    const isGuest = userId.startsWith("guest_") || userId.startsWith("guest:");
    const quota = consumeStudyAiQuota({
      key: `grade-answer:${userId}`,
      limit: isGuest ? 30 : 200,
      windowMs: 60 * 60 * 1000,
    });
    if (!quota.allowed) {
      return fail(`Rate limit reached. Try again in ${quota.retryAfterSeconds} seconds.`, 429);
    }

    const body = (await request.json()) as {
      question?: string;
      modelAnswer?: string;
      studentAnswer?: string;
    };
    const question = String(body.question || "").trim().slice(0, 2000);
    const modelAnswer = String(body.modelAnswer || "").trim().slice(0, 1000);
    const studentAnswer = String(body.studentAnswer || "").trim().slice(0, 1000);
    if (!question || !modelAnswer) {
      return fail("question and modelAnswer are required");
    }
    if (!studentAnswer) {
      return ok({ correct: false, feedback: "No answer given." });
    }

    const raw = await generateGeminiText({
      systemInstruction: gradingSystemInstruction(),
      userPrompt: gradingUserPrompt({ question, modelAnswer, studentAnswer }),
      temperature: 0.1,
      maxOutputTokens: 200,
      responseJson: true,
    });
    const parsed = parseJson<{ correct?: boolean; feedback?: string }>(raw);

    return ok({
      correct: Boolean(parsed?.correct),
      feedback: String(parsed?.feedback || "").trim(),
    });
  } catch (error) {
    console.error("study.grade-answer.POST", error);
    if (error instanceof GeminiConfigError) {
      return fail(
        "AI is not configured on the server (missing or invalid GEMINI_API_KEY).",
        503,
      );
    }
    const detail = error instanceof Error && error.message ? error.message : "Failed to grade answer";
    return fail(detail, 502);
  }
}
