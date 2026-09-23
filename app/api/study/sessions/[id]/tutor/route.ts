import { NextRequest } from "next/server";
import { topChunksByQuery } from "@/app/lib/server/study/text";
import {
  getSession,
  getSessionSourceText,
  reindexStaleStudySources,
  saveTutorMessage,
} from "@/app/lib/server/study/repo";
import { retrieveStudyContext } from "@/app/lib/server/study/studyRag";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import {
  generateGeminiMultimodalText,
  generateGeminiText,
  streamGeminiText,
} from "@/app/lib/server/ai/gemini";
import {
  buildTutorUserPrompt,
  tutorSystemInstruction,
  TUTOR_MARKDOWN_RULES,
} from "@/app/lib/server/study/prompts";
import { StudyLearningMode } from "@/app/lib/server/study/types";
import { consumeStudyAiQuota } from "@/app/lib/server/study/rateLimit";
import { checkAndReserveBillingUsage, reportBillingUsage } from "@/app/lib/server/study/billingGate";

export const dynamic = "force-dynamic";

type TutorAttachment = {
  type?: string;
  name?: string;
  mimeType?: string;
  dataUrl?: string;
};

type TutorProvenance = "source" | "general" | "image";

const TUTOR_MAX_OUTPUT_TOKENS = 8192;
// Socratic (assignment) turns must stay short — one guiding question or a
// small partial hint, never a full breakdown — so give the model much less
// room to work with than other modes, reinforcing the prompt's hard rule.
const ASSIGNMENT_MAX_OUTPUT_TOKENS = 1024;

// Action chips (Hint/Why?/ELI6/Step-by-Step) always pass groundedText — they
// re-process one fixed piece of on-screen text and are expected to give a
// complete answer, not hold back like a fresh Socratic conversational turn.
// Only a freeform assignment-mode message (no groundedText) gets the smaller
// budget that keeps the model from dumping a full breakdown unprompted.
function outputBudgetFor(mode: StudyLearningMode, isGroundedActionChip: boolean): number {
  return mode === "assignment" && !isGroundedActionChip
    ? ASSIGNMENT_MAX_OUTPUT_TOKENS
    : TUTOR_MAX_OUTPUT_TOKENS;
}

const TUTOR_SYSTEM_MARKDOWN =
  " Always format answers in readable Markdown (headings, lists, bold keywords, blank lines between sections).";

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function shouldAttemptTutorContinuation(answer: string, finishReason?: string) {
  if (finishReason === "MAX_TOKENS") return true;
  const t = answer.trimEnd();
  if (t.length < 40) return false;
  if (/[.!?…]["']?\s*$/.test(t)) return false;
  if (/\s(or|nor)\s*$/i.test(t)) return true;
  if (/\s(and|but)\s*$/i.test(t)) return true;
  return false;
}

async function continuePartialTutorAnswer(input: {
  partialAnswer: string;
  userQuestion: string;
  context: string;
  maxOutputTokens: number;
}) {
  const tail = input.partialAnswer.slice(-12000);
  return generateGeminiText({
    systemInstruction:
      `You continue a friendly student tutor reply. Output ONLY new text after the partial answer — do not repeat prior content. Plain English; Markdown; complete every sentence.${TUTOR_SYSTEM_MARKDOWN}`,
    userPrompt: [
      "USER QUESTION:",
      input.userQuestion,
      "",
      "SOURCE CONTEXT:",
      input.context || "(none)",
      "",
      "PARTIAL ANSWER SO FAR (continue immediately after this; never repeat it):",
      tail,
      "",
      "Write only what comes next until the question is fully answered.",
    ].join("\n"),
    temperature: 0.15,
    maxOutputTokens: input.maxOutputTokens,
  });
}

function resolveLearningMode(mode?: string): StudyLearningMode {
  return mode === "exam" || mode === "quiz" || mode === "research" || mode === "assignment"
    ? mode
    : "research";
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
      key: `tutor:${userId}`,
      limit: isGuest ? 10 : 120,
      windowMs: 60 * 60 * 1000,
    });
    if (!quota.allowed) {
      return fail(`Tutor rate limit reached. Try again in ${quota.retryAfterSeconds} seconds.`, 429);
    }

    const body = (await request.json()) as {
      message?: string;
      stream?: boolean;
      attachments?: TutorAttachment[];
      mode?: StudyLearningMode;
      examTopics?: string[];
      tutorContext?: string;
      groundedText?: string;
    };
    const learningMode = resolveLearningMode(body.mode);
    const examTopics = Array.isArray(body.examTopics)
      ? body.examTopics.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : [];
    const tutorContext = String(body.tutorContext || "").trim().slice(0, 2500);
    // Inline action chips (Hint/Why?/ELI6/Step-by-Step) must process the EXACT
    // AI message currently rendered on screen, not re-derive relevance via a
    // fresh RAG query keyed off the student's last typed question — that drifts
    // to unrelated document chunks. When the caller supplies the on-screen text
    // directly, skip retrieval entirely and ground the answer in it.
    const groundedText = String(body.groundedText || "").trim().slice(0, 12000);
    const outputBudget = outputBudgetFor(learningMode, Boolean(groundedText));

    // Same free-run-count / credit-balance gate every other tool enforces —
    // Study Workspace only ever had its own generous rate limiter above, so a
    // signed-in user with zero free runs left could still use the tutor
    // indefinitely. Guests are exempt here (their own separate, tighter
    // rate-limit cap above already governs them), matching every NestJS tool
    // route's OptionalAuthGuard pattern.
    let billingReservationId: string | null = null;
    if (!isGuest) {
      const gate = await checkAndReserveBillingUsage({
        request,
        service: "study.tutor",
        estimatedPromptTokens: 2000,
        estimatedCompletionTokens: outputBudget,
      });
      if (gate.blocked) return gate.response;
      billingReservationId = gate.reservationId;
    }
    const message = (body?.message || "").trim();
    const useStream = Boolean(body?.stream);
    const imageAttachments = Array.isArray(body?.attachments)
      ? body.attachments.filter((item) => item?.type === "image")
      : [];
    const attachmentContext = imageAttachments
      .map((item, index) => {
        const safeName = (item.name || `image-${index + 1}`).trim();
        const safeType = (item.mimeType || "image/*").trim();
        return `Image ${index + 1}: ${safeName} (${safeType})`;
      })
      .join("\n");
    const messageWithAttachmentContext = attachmentContext
      ? `${message}\n\nAttached images:\n${attachmentContext}`
      : message;
    if (!message) {
      return fail("message is required");
    }

    let hasRelevantContext: boolean;
    let context: string;
    let citations: number[];

    if (groundedText) {
      // Grounded action chip: the caller already knows exactly which text the
      // answer must be based on (the AI message rendered on screen), so skip
      // retrieval entirely rather than re-deriving relevance from `message`
      // (e.g. a synthetic "give me a hint about X" prompt), which would drift
      // to whatever the RAG query happens to match instead of the exact
      // passage the student is looking at.
      hasRelevantContext = true;
      context = groundedText;
      citations = [];
    } else {
      // Hybrid RAG retrieval (vector + keyword), with an automatic keyword-only
      // fallback when embeddings aren't ready yet — so latency/behavior stay
      // stable right after upload. If RAG fails entirely, fall back to the legacy
      // keyword ranker over the stored chunks so the tutor never breaks.
      //
      // topK is sized for real grounding: 3 chunks (~2k chars) out of a
      // 100-page document starved the model of context and made it answer from
      // prior knowledge (hallucination). 8–10 hits + their neighbors is still
      // tiny vs the model's context window, but enough to actually answer from.
      const chunkLimit = learningMode === "exam" ? 10 : 8;
      // Self-heal any sources whose vectors are missing/stale (embed failed at
      // upload, process stopped mid-index, or model drift) BEFORE retrieving, so
      // this query benefits from recovered vectors instead of silently degrading
      // to keyword-only forever. Bounded + best-effort; never breaks the tutor.
      try {
        await reindexStaleStudySources(params.id);
      } catch (error) {
        console.error("study.tutor.reindex_stale_failed", error);
      }
      let ranked: Array<{
        index: number;
        chunk: string;
        score: number;
        vectorScore?: number;
        keywordScore?: number;
      }> = [];
      try {
        ranked = await retrieveStudyContext(params.id, message, chunkLimit);
      } catch (error) {
        console.error("study.tutor.retrieve_failed", error);
      }
      if (ranked.length === 0) {
        const { chunks } = await getSessionSourceText(params.id);
        // Legacy ranker's score counts matched query tokens — a genuine keyword
        // relevance signal, so expose it as keywordScore for the check below.
        ranked = topChunksByQuery(chunks, message, chunkLimit).map((item) => ({
          ...item,
          keywordScore: item.score,
        }));
      }
      // "Relevant" must mean the chunks actually MATCHED the query. The fused
      // RRF/cosine `score` is > 0 for every returned hit by construction, so the
      // old `score > 0` check was always true — the prompt then claimed relevant
      // context even when retrieval found nothing, and the model confidently
      // "cited" unrelated chunks (hallucination). Require a real signal: a BM25
      // keyword match, or a cosine similarity high enough to indicate topical fit.
      const MIN_VECTOR_RELEVANCE = 0.55;
      const isRelevantHit = (item: { keywordScore?: number; vectorScore?: number }) =>
        (item.keywordScore ?? 0) > 0 ||
        (item.vectorScore ?? 0) >= MIN_VECTOR_RELEVANCE;
      // When at least one hit is relevant, keep the whole retrieved window
      // (neighbor/expansion chunks carry no per-strategy score but provide the
      // surrounding sentences that make a hit answerable). When NOTHING is
      // relevant, inject no context at all: feeding zero-score chunks in as
      // "[n] …" invited the model to cite unrelated material even though
      // hasRelevantContext was false.
      hasRelevantContext = ranked.some(isRelevantHit);
      const contextChunks = hasRelevantContext ? ranked : [];
      context = contextChunks
        .map((item) => `[${item.index}] ${item.chunk}`)
        .join("\n\n");
      // Only cite chunks we actually injected as context — otherwise the stored
      // citation ids point at material the model never saw.
      citations = contextChunks.map((item) => item.index);
    }
    const hasImages = imageAttachments.length > 0;
    const provenance: TutorProvenance = hasImages
      ? "image"
      : hasRelevantContext
        ? "source"
        : "general";

    if (useStream) {
      if (!process.env.GEMINI_API_KEY) {
        return fail("GEMINI_API_KEY is missing on the server", 500);
      }

      const encoder = new TextEncoder();
      const now = new Date();
      await saveTutorMessage({
        sessionId: params.id,
        role: "user",
        message,
        mode: learningMode,
        attachments:
          imageAttachments.length > 0
            ? imageAttachments
                .map((item) => {
                  const dataUrl = (item.dataUrl || "").trim();
                  if (!dataUrl.startsWith("data:image/")) return null;
                  return {
                    name: (item.name || "image").trim() || "image",
                    mimeType: (item.mimeType || "image/jpeg").trim(),
                    dataUrl,
                  };
                })
                .filter((x): x is NonNullable<typeof x> => Boolean(x))
                .slice(0, 4)
            : undefined,
        citations: [],
        createdAt: now,
      });

      const stream = new ReadableStream<Uint8Array>({
        start: async (controller) => {
          let fullAnswer = "";
          let emittedChunks = 0;
          const streamMeta: { finishReason?: string } = {};
          try {
            if (hasImages) {
              const parsedImages = imageAttachments
                .map((item) => parseDataUrl(item.dataUrl || ""))
                .filter((item): item is { mimeType: string; data: string } => Boolean(item))
                .slice(0, 4);
              if (parsedImages.length > 0) {
                const multimodalAnswer = await generateGeminiMultimodalText({
                  systemInstruction:
                    `${tutorSystemInstruction(learningMode)} Analyze attached images clearly for a student. Distinguish what you see vs what you infer. Cite source ids like [2] when using context.${TUTOR_SYSTEM_MARKDOWN}`,
                  userPrompt: [
                    "QUESTION:",
                    messageWithAttachmentContext,
                    "",
                    "SOURCE CONTEXT WITH CITATION IDS:",
                    context || "(none)",
                    "",
                    "Format:",
                    "- What I can see",
                    "- Likely purpose",
                    "- Answer",
                    "- Caveats (if uncertain)",
                    "",
                    TUTOR_MARKDOWN_RULES,
                  ].join("\n"),
                  images: parsedImages,
                  temperature: 0.2,
                  maxOutputTokens: outputBudget,
                });
                fullAnswer = multimodalAnswer.trim();
              }
              if (fullAnswer) {
                emittedChunks = 1;
                controller.enqueue(
                  encoder.encode(
                    `event: chunk\ndata: ${JSON.stringify({ text: fullAnswer })}\n\n`,
                  ),
                );
              }
            } else {
              for await (const chunk of streamGeminiText({
                systemInstruction: `${tutorSystemInstruction(learningMode)}${TUTOR_SYSTEM_MARKDOWN}`,
                userPrompt: buildTutorUserPrompt({
                  question: messageWithAttachmentContext,
                  context,
                  hasRelevantContext,
                  mode: learningMode,
                  examTopics,
                  tutorContext,
                  isGroundedInOnScreenText: Boolean(groundedText),
                }),
                temperature: 0.25,
                maxOutputTokens: outputBudget,
                streamMetaOut: streamMeta,
              })) {
                if (!chunk) continue;
                let delta = chunk;
                if (fullAnswer.length > 0 && chunk.startsWith(fullAnswer)) {
                  delta = chunk.slice(fullAnswer.length);
                }
                fullAnswer += delta;
                if (!delta) continue;
                emittedChunks += 1;
                controller.enqueue(
                  encoder.encode(
                    `event: chunk\ndata: ${JSON.stringify({ text: delta })}\n\n`,
                  ),
                );
              }
            }
            let answer = fullAnswer.trim();
            if (
              !hasImages &&
              answer.length > 0 &&
              shouldAttemptTutorContinuation(answer, streamMeta.finishReason)
            ) {
              try {
                const more = await continuePartialTutorAnswer({
                  partialAnswer: answer,
                  userQuestion: messageWithAttachmentContext,
                  context,
                  maxOutputTokens: outputBudget,
                });
                const extra = more.trim();
                if (extra) {
                  answer = `${answer}\n\n${extra}`.trim();
                  emittedChunks += 1;
                  controller.enqueue(
                    encoder.encode(
                      `event: chunk\ndata: ${JSON.stringify({ text: extra })}\n\n`,
                    ),
                  );
                }
              } catch (contErr) {
                console.error("study.tutor.POST.stream.continuation", contErr);
              }
            }
            if (!answer || emittedChunks === 0) {
              answer = await generateGeminiText({
                systemInstruction: `${tutorSystemInstruction(learningMode)}${TUTOR_SYSTEM_MARKDOWN}`,
                userPrompt: buildTutorUserPrompt({
                  question: messageWithAttachmentContext,
                  context,
                  hasRelevantContext,
                  mode: learningMode,
                  examTopics,
                  tutorContext,
                  isGroundedInOnScreenText: Boolean(groundedText),
                }),
                temperature: 0.25,
                maxOutputTokens: outputBudget,
              });
              if (answer.trim()) {
                controller.enqueue(
                  encoder.encode(
                    `event: chunk\ndata: ${JSON.stringify({ text: answer.trim() })}\n\n`,
                  ),
                );
              }
            }
            await saveTutorMessage({
              sessionId: params.id,
              role: "assistant",
              message: answer || "I could not generate a response. Please retry.",
              mode: learningMode,
              citations,
              provenance,
              createdAt: new Date(),
            });
            controller.enqueue(
              encoder.encode(
                `event: done\ndata: ${JSON.stringify({ citations, provenance })}\n\n`,
              ),
            );
            controller.close();
            if (!isGuest) {
              reportBillingUsage({
                request,
                reservationId: billingReservationId,
                promptTokens: 2000,
                completionTokens: outputBudget,
              });
            }
          } catch (error) {
            console.error("study.tutor.POST.stream", error);
            const message =
              error instanceof Error
                ? error.message
                : "Tutor stream failed due to an unknown error";
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({ message })}\n\n`,
              ),
            );
            controller.close();
          }
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    let answer = "";
    if (hasImages) {
      const parsedImages = imageAttachments
        .map((item) => parseDataUrl(item.dataUrl || ""))
        .filter((item): item is { mimeType: string; data: string } => Boolean(item))
        .slice(0, 4);
      if (parsedImages.length > 0) {
        answer = await generateGeminiMultimodalText({
          systemInstruction:
            `${tutorSystemInstruction(learningMode)} Analyze images for a student.${TUTOR_SYSTEM_MARKDOWN}`,
          userPrompt: [
            "QUESTION:",
            messageWithAttachmentContext,
            "",
            "SOURCE CONTEXT WITH CITATION IDS:",
            context || "(none)",
            "",
            TUTOR_MARKDOWN_RULES,
          ].join("\n"),
          images: parsedImages,
          temperature: 0.2,
          maxOutputTokens: outputBudget,
        });
      }
    } else {
      answer = await generateGeminiText({
        systemInstruction: `${tutorSystemInstruction(learningMode)}${TUTOR_SYSTEM_MARKDOWN}`,
        userPrompt: buildTutorUserPrompt({
          question: messageWithAttachmentContext,
          context,
          hasRelevantContext,
          mode: learningMode,
          examTopics,
          tutorContext,
          isGroundedInOnScreenText: Boolean(groundedText),
        }),
        temperature: 0.25,
        maxOutputTokens: outputBudget,
      });
    }
    if (!answer.trim()) {
      answer = await generateGeminiText({
        systemInstruction: `${tutorSystemInstruction(learningMode)}${TUTOR_SYSTEM_MARKDOWN}`,
        userPrompt: buildTutorUserPrompt({
          question: messageWithAttachmentContext,
          context,
          hasRelevantContext,
          mode: learningMode,
          examTopics,
          tutorContext,
          isGroundedInOnScreenText: Boolean(groundedText),
        }),
        temperature: 0.25,
        maxOutputTokens: outputBudget,
      });
    }

    const now = new Date();
    await Promise.all([
      saveTutorMessage({
        sessionId: params.id,
        role: "user",
        message,
        mode: learningMode,
        attachments:
          imageAttachments.length > 0
            ? imageAttachments
                .map((item) => {
                  const dataUrl = (item.dataUrl || "").trim();
                  if (!dataUrl.startsWith("data:image/")) return null;
                  return {
                    name: (item.name || "image").trim() || "image",
                    mimeType: (item.mimeType || "image/jpeg").trim(),
                    dataUrl,
                  };
                })
                .filter((x): x is NonNullable<typeof x> => Boolean(x))
                .slice(0, 4)
            : undefined,
        citations: [],
        createdAt: now,
      }),
      saveTutorMessage({
        sessionId: params.id,
        role: "assistant",
        message: answer,
        mode: learningMode,
        citations,
        provenance,
        createdAt: now,
      }),
    ]);

    if (!isGuest) {
      reportBillingUsage({
        request,
        reservationId: billingReservationId,
        promptTokens: 2000,
        completionTokens: outputBudget,
      });
    }

    return ok({
      answer,
      citations,
      provenance,
    });
  } catch (error) {
    console.error("study.tutor.POST", error);
    return fail("Failed to answer tutor query", 500);
  }
}
