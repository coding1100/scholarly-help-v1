import { NextRequest, NextResponse } from "next/server";
import { generateGeminiText } from "@/app/lib/server/ai/gemini";
import { scoreHeuristic } from "@/app/lib/server/ai/heuristic-detector";

export const dynamic = "force-dynamic";

type AiDetectBody = {
  text?: string;
};

type ParsedDetectorOutput = {
  aiPercent: number;
  humanPercent: number;
  reason?: string;
  confidence?: number;
};

function clampPercent(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function extractJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = raw.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as any;
  } catch {
    return null;
  }
}

function clampConfidence(x: number) {
  if (!Number.isFinite(x)) return 55;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function normalizeParsedOutput(parsed: any): ParsedDetectorOutput | null {
  const aiPercentRaw =
    typeof parsed?.aiPercent === "number"
      ? parsed.aiPercent
      : Number(parsed?.aiPercent);
  if (!Number.isFinite(aiPercentRaw)) return null;

  let aiPercent = clampPercent(aiPercentRaw);
  let humanPercent = 100 - aiPercent;

  const humanPercentRaw =
    typeof parsed?.humanPercent === "number"
      ? parsed.humanPercent
      : Number(parsed?.humanPercent);
  if (Number.isFinite(humanPercentRaw)) {
    const hp = clampPercent(humanPercentRaw);
    const sum = aiPercent + hp;
    if (sum === 100) {
      humanPercent = hp;
    } else if (sum > 0) {
      aiPercent = clampPercent((aiPercent / sum) * 100);
      humanPercent = 100 - aiPercent;
    }
  }

  const confidenceRaw =
    typeof parsed?.confidence === "number"
      ? parsed.confidence
      : Number(parsed?.confidence);
  const confidence = Number.isFinite(confidenceRaw)
    ? clampConfidence(confidenceRaw)
    : 55;

  const reason = typeof parsed?.reason === "string" ? parsed.reason.slice(0, 240) : "";
  return { aiPercent, humanPercent, reason, confidence };
}

function tryParseDetectorOutput(raw: string): ParsedDetectorOutput | null {
  const trimmed = raw.trim();
  // 1) Direct JSON parse (best case).
  try {
    const parsed = JSON.parse(trimmed) as any;
    return normalizeParsedOutput(parsed);
  } catch {
    // ignore
  }
  // 2) Extract first {...} block.
  const extracted = extractJsonObject(trimmed);
  if (extracted) {
    const normalized = normalizeParsedOutput(extracted);
    if (normalized) return normalized;
  }
  // 3) Regex fallback if model returns prose like "AI: 72%".
  const m =
    trimmed.match(/ai\s*percent\s*[:=]\s*(\d{1,3})/i) ||
    trimmed.match(/(\d{1,3})\s*%\s*(?:ai|ai-generated)/i) ||
    trimmed.match(/\bai\b[^0-9]{0,20}(\d{1,3})\s*%/i);
  if (m) {
    const aiPercent = Number(m[1]);
    return {
      aiPercent: clampPercent(aiPercent),
      humanPercent: 100 - clampPercent(aiPercent),
      reason: "",
      confidence: 40,
    };
  }
  // 4) Very last resort: any standalone 0-100 integer.
  const anyInt = trimmed.match(/\b(100|[1-9]?\d)\b/);
  if (anyInt) {
    const aiPercent = Number(anyInt[1]);
    return {
      aiPercent: clampPercent(aiPercent),
      humanPercent: 100 - clampPercent(aiPercent),
      reason: "",
      confidence: 30,
    };
  }
  return null;
}

function toWords(text: string) {
  return text.toLowerCase().match(/[a-z0-9']+/g) || [];
}

// Sentence stylometry, AI-tell counting, and the evidence-anchored scorer all live in
// the pure, testable heuristic-detector module so this route stays thin.

function chunkTextForDetection(text: string, maxWordsPerChunk = 220) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWordsPerChunk) return [text];

  const chunks: string[] = [];
  const step = Math.max(140, Math.floor(maxWordsPerChunk * 0.75));
  for (let i = 0; i < words.length && chunks.length < 4; i += step) {
    const chunk = words.slice(i, i + maxWordsPerChunk).join(" ").trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks.length ? chunks : [text];
}

async function runGeminiDetect(cappedText: string, strict: boolean) {
  const systemInstruction = strict
    ? [
        "You are an AI-writing detector.",
        "Return EXACTLY one JSON object and nothing else.",
        'Format: {"aiPercent":<int 0-100>,"humanPercent":<int 0-100>,"confidence":<int 0-100>,"reason":"<20 words>"}',
        "aiPercent + humanPercent = 100.",
        "Do not wrap in backticks. Do not add explanations outside JSON.",
      ].join("\n")
    : [
        "You are an expert AI Text Detector. Analyze the user's text to determine if it was written by an LLM or a human. Look for low burstiness (uniform sentence lengths), lack of natural emotion, and overused AI vocabulary (e.g., *delve, testament, tapestry, landscape, furthermore*).",
        'Return ONLY valid JSON (no markdown, no extra text): {"aiPercent":0-100,"humanPercent":0-100,"confidence":0-100,"reason":"<=20 words"}.',
        "aiPercent + humanPercent MUST equal 100.",
        "confidence reflects your certainty from stylometric cues.",
        "Estimate using writing signals: uniform tone, generic phrasing, low specificity, textbook-like structure, lack of personal idiosyncrasies.",
        "If the passage reads like polished encyclopedic output, aiPercent should be high.",
      ].join("\n");

  return generateGeminiText({
    systemInstruction,
    userPrompt: `Text:\n${cappedText}`,
    temperature: 0.1,
    maxOutputTokens: 220,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is missing on the server" },
        { status: 500 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as AiDetectBody;
    const text = String(body?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "text is required" },
        { status: 400 },
      );
    }

    // Keep it aligned with HumanizerTool (1500 words max on UI).
    // We also cap characters defensively to avoid huge prompts.
    const cappedText = text.slice(0, 18000);
    const chunks = chunkTextForDetection(cappedText);
    const heuristic = scoreHeuristic(cappedText);

    const llmScores: ParsedDetectorOutput[] = [];
    for (const chunk of chunks) {
      const responseText = await runGeminiDetect(chunk, false);
      let parsed = tryParseDetectorOutput(responseText);
      if (!parsed) {
        // One retry with even stricter formatting instructions.
        const retryText = await runGeminiDetect(chunk.slice(0, 12000), true);
        parsed = tryParseDetectorOutput(retryText);
        if (!parsed) {
          console.warn("ai-detect.unexpected_format", {
            sample: String(retryText || responseText).slice(0, 260),
          });
          continue;
        }
      }
      llmScores.push(parsed);
    }

    let llmAi = heuristic.aiPercent;
    let llmConfidence = 0;
    let reason = "";
    if (llmScores.length > 0) {
      llmAi =
        llmScores.reduce((acc, item) => acc + item.aiPercent, 0) / llmScores.length;
      llmConfidence =
        llmScores.reduce((acc, item) => acc + (item.confidence ?? 55), 0) /
        llmScores.length;
      reason = llmScores.find((x) => x.reason)?.reason || "";
    }

    // Confidence-weighted blend. The previous code floored the LLM weight at 0.55,
    // so a noisy single-shot Gemini guess always overrode the deterministic signals
    // and produced the inconsistent scores QA saw. Now each source is weighted by its
    // own confidence, with the LLM capped so it can inform but not dominate the
    // explainable heuristic. When the LLM is unavailable, the heuristic stands alone.
    const heuristicConfidence = heuristic.confidence / 100;
    const rawLlmWeight =
      llmScores.length > 0 ? Math.min(0.5, llmConfidence / 100) : 0;
    const totalConfidence = rawLlmWeight + heuristicConfidence || 1;
    const llmWeight = rawLlmWeight / totalConfidence;
    const heuristicWeight = heuristicConfidence / totalConfidence;
    const blended = llmAi * llmWeight + heuristic.aiPercent * heuristicWeight;

    // Reduce overconfidence on short inputs.
    const words = toWords(cappedText).length;
    const shortPenalty = words < 80 ? 0.82 : words < 140 ? 0.9 : 1;
    let aiPercent = clampPercent(blended * shortPenalty);
    let humanPercent = 100 - aiPercent;

    if (!reason) {
      reason =
        words < 80
          ? "Short text: lower confidence estimate."
          : llmScores.length > 0
            ? "Estimated from language patterns and structure."
            : "Estimated from stylometric heuristics only.";
    }

    return NextResponse.json({
      success: true,
      aiPercent,
      humanPercent,
      reason,
      meta: {
        modelSamples: llmScores.length,
        heuristicConfidence: heuristic.confidence,
        // Surface which signals fired so QA/users can see why the score landed where
        // it did, and so a humanized passage's remaining tells are visible.
        signals: heuristic.firedSignals,
        details: heuristic.details,
      },
    });
  } catch (error) {
    console.error("ai-detect.POST", error);
    const message = error instanceof Error ? error.message : "AI detect failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

