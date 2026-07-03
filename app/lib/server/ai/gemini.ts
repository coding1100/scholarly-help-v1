const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

type GeminiPart = { text: string };
type GeminiInlinePart = {
  inline_data: {
    mime_type: string;
    data: string;
  };
};
type GeminiCandidate = {
  content?: {
    parts?: Array<GeminiPart | GeminiInlinePart>;
  };
  finishReason?: string;
};

type GeminiGenerateResponse = {
  candidates?: GeminiCandidate[];
};

/** Stream chunks must not use .trim() — it can drop spaces between tokens. */
function extractTextFromPartsRaw(payload: GeminiGenerateResponse) {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => ("text" in part ? part.text || "" : ""))
    .join("");
}

function getCandidateFinishReason(payload: GeminiGenerateResponse) {
  return payload.candidates?.[0]?.finishReason;
}

function extractStreamedTextFromSsePayload(payloadRaw: string) {
  const trimmed = payloadRaw.trim();
  if (!trimmed || trimmed === "[DONE]") {
    return { text: "", finishReason: undefined as string | undefined };
  }
  try {
    const payload = JSON.parse(trimmed) as GeminiGenerateResponse;
    return {
      text: extractTextFromPartsRaw(payload),
      finishReason: getCandidateFinishReason(payload),
    };
  } catch {
    return { text: "", finishReason: undefined };
  }
}

function getModelName() {
  return process.env.GEMINI_MODEL_ID || process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return key;
}

function extractText(payload: GeminiGenerateResponse) {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => ("text" in part ? part.text || "" : ""))
    .join("\n")
    .trim();
}

async function callGeminiGenerate(input: {
  systemInstruction: string;
  parts: Array<GeminiPart | GeminiInlinePart>;
  temperature?: number;
  maxOutputTokens?: number;
  /**
   * Optional sampler seed. Gemini is otherwise near-deterministic on structured
   * JSON tasks even at temperature > 0, so callers that need genuinely different
   * output across identical prompts (e.g. "Regenerate") must vary this.
   */
  seed?: number;
  /** Sampling nucleus. Raise alongside temperature to widen token choice. */
  topP?: number;
}) {
  const apiKey = getApiKey();
  const model = getModelName();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: input.systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: input.parts,
            },
          ],
          generationConfig: {
            temperature: input.temperature ?? 0.3,
            maxOutputTokens: input.maxOutputTokens ?? 1400,
            ...(typeof input.seed === "number" ? { seed: input.seed } : {}),
            ...(typeof input.topP === "number" ? { topP: input.topP } : {}),
          },
        }),
      },
    );
    if (!response.ok) {
      const raw = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${raw.slice(0, 300)}`);
    }
    const payload = (await response.json()) as GeminiGenerateResponse;
    const text = extractText(payload);
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateGeminiText(input: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  seed?: number;
  topP?: number;
}) {
  return callGeminiGenerate({
    systemInstruction: input.systemInstruction,
    parts: [{ text: input.userPrompt }],
    temperature: input.temperature,
    maxOutputTokens: input.maxOutputTokens,
    seed: input.seed,
    topP: input.topP,
  });
}

export async function generateGeminiMultimodalText(input: {
  systemInstruction: string;
  userPrompt: string;
  images: Array<{ mimeType: string; data: string }>;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const imageParts: GeminiInlinePart[] = input.images.map((item) => ({
    inline_data: {
      mime_type: item.mimeType,
      data: item.data,
    },
  }));
  return callGeminiGenerate({
    systemInstruction: input.systemInstruction,
    parts: [{ text: input.userPrompt }, ...imageParts],
    temperature: input.temperature,
    maxOutputTokens: input.maxOutputTokens,
  });
}

export async function* streamGeminiText(input: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Last finishReason from the API is written here (e.g. MAX_TOKENS, STOP). */
  streamMetaOut?: { finishReason?: string };
}) {
  const apiKey = getApiKey();
  const model = getModelName();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: input.systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: input.userPrompt }],
            },
          ],
          generationConfig: {
            temperature: input.temperature ?? 0.25,
            maxOutputTokens: input.maxOutputTokens ?? 4096,
          },
        }),
      },
    );
    if (!response.ok || !response.body) {
      const raw = await response.text();
      throw new Error(`Gemini stream API error (${response.status}): ${raw.slice(0, 300)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const event of events) {
        const dataLines = event
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.startsWith("data:"));
        for (const line of dataLines) {
          const payloadRaw = line.replace(/^data:\s*/, "");
          const { text, finishReason } = extractStreamedTextFromSsePayload(payloadRaw);
          if (finishReason) {
            input.streamMetaOut && (input.streamMetaOut.finishReason = finishReason);
          }
          if (text) {
            yield text;
          }
        }
      }
    }
    if (buffer.trim()) {
      const dataLines = buffer
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.startsWith("data:"));
      for (const line of dataLines) {
        const payloadRaw = line.replace(/^data:\s*/, "");
        const { text, finishReason } = extractStreamedTextFromSsePayload(payloadRaw);
        if (finishReason) {
          input.streamMetaOut && (input.streamMetaOut.finishReason = finishReason);
        }
        if (text) {
          yield text;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini stream request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
