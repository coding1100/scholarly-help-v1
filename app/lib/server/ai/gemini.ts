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

/**
 * Thrown when the Gemini API key is missing/blank. This is a SERVER
 * MISCONFIGURATION, not a transient model failure — callers must not silently
 * swallow it into a deterministic fallback (that makes a broken deploy look like
 * a working, if repetitive, feature). Surface it so the deploy gets fixed.
 */
export class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigError";
  }
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) {
    throw new GeminiConfigError(
      "GEMINI_API_KEY is not configured on the server.",
    );
  }
  return key.trim();
}

function extractText(payload: GeminiGenerateResponse) {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => ("text" in part ? part.text || "" : ""))
    .join("\n")
    .trim();
}

/**
 * gemini-2.5-flash THINKS by default, and thought tokens count against
 * maxOutputTokens. Structured-output calls with tight budgets (700–5000 tokens)
 * can therefore burn the whole budget on thinking and return EMPTY or truncated
 * JSON — which upstream code treats as a failure and silently replaces with a
 * deterministic fallback. Disabling thinking for these calls makes the output
 * budget mean what callers think it means. Only 2.5-flash variants accept
 * thinkingBudget: 0 (2.5-pro has a floor; 2.0 models reject thinkingConfig).
 */
function thinkingConfigFor(model: string): { thinkingBudget: number } | null {
  return /2\.5.*flash/i.test(model) ? { thinkingBudget: 0 } : null;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

/** Key-related failures only; a 400 from e.g. a bad generationConfig is NOT one. */
function isKeyRejection(status: number, raw: string): boolean {
  if (status === 401 || status === 403) return true;
  return status === 400 && /API[_ ]?KEY|API key/i.test(raw);
}

type GenerateInput = {
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
  /**
   * Ask the API for a JSON response (responseMimeType application/json). Use
   * for every call whose output is parsed with JSON.parse — it eliminates
   * markdown fences and drastically reduces malformed-JSON failures.
   */
  responseJson?: boolean;
};

async function callGeminiGenerateOnce(input: GenerateInput): Promise<string> {
  const apiKey = getApiKey();
  const model = getModelName();
  const thinkingConfig = thinkingConfigFor(model);
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
            ...(input.responseJson
              ? { responseMimeType: "application/json" }
              : {}),
            ...(thinkingConfig ? { thinkingConfig } : {}),
          },
        }),
      },
    );
    if (!response.ok) {
      const raw = await response.text();
      // A missing/wrong/unauthorized key is a config problem, not a transient
      // model hiccup. Surface it as such so it isn't hidden behind a fallback.
      if (isKeyRejection(response.status, raw)) {
        throw new GeminiConfigError(
          `Gemini rejected the API key (${response.status}): ${raw.slice(0, 200)}`,
        );
      }
      const error = new Error(
        `Gemini API error (${response.status}): ${raw.slice(0, 300)}`,
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    const payload = (await response.json()) as GeminiGenerateResponse;
    const text = extractText(payload);
    if (!text) {
      const finishReason = getCandidateFinishReason(payload);
      throw new Error(
        `Gemini returned an empty response${finishReason ? ` (finishReason: ${finishReason})` : ""}.`,
      );
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

/**
 * Generate with bounded retries on transient failures (429 rate limits and
 * 5xx). The study map-reduce path fires several concurrent calls, so brief
 * rate-limit bursts are normal — without retries they cascaded into the
 * deterministic offline fallback. Config errors never retry.
 */
async function callGeminiGenerate(input: GenerateInput): Promise<string> {
  const MAX_ATTEMPTS = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await callGeminiGenerateOnce(input);
    } catch (error) {
      lastError = error;
      if (error instanceof GeminiConfigError) throw error;
      const status = (error as Error & { status?: number }).status;
      const retryable =
        (typeof status === "number" && isRetryableStatus(status)) ||
        (error instanceof Error && /timed out|empty response/i.test(error.message));
      if (!retryable || attempt === MAX_ATTEMPTS - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function generateGeminiText(input: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  seed?: number;
  topP?: number;
  responseJson?: boolean;
}) {
  return callGeminiGenerate({
    systemInstruction: input.systemInstruction,
    parts: [{ text: input.userPrompt }],
    temperature: input.temperature,
    maxOutputTokens: input.maxOutputTokens,
    seed: input.seed,
    topP: input.topP,
    responseJson: input.responseJson,
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
            // Same rationale as generateContent: don't let silent thinking
            // consume the visible-output budget (and add latency) on flash.
            ...(thinkingConfigFor(getModelName())
              ? { thinkingConfig: thinkingConfigFor(getModelName()) }
              : {}),
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
