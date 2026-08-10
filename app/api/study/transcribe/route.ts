import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId } from "@/app/lib/server/study/http";
import { consumeStudyAiQuota } from "@/app/lib/server/study/rateLimit";
import { getGeminiModelName } from "@/app/lib/server/ai/gemini";

export const dynamic = "force-dynamic";

// Gemini supports these audio MIME types for inline data
const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
]);

const AUDIO_EXTENSIONS: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  webm: "audio/webm",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  mp4: "audio/mp4",
};

// 20 MB hard cap — Gemini inline audio limit
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

function resolveMimeType(file: File): string {
  if (file.type && SUPPORTED_AUDIO_MIME_TYPES.has(file.type)) return file.type;
  const ext = (file.name || "").toLowerCase().split(".").pop() || "";
  return AUDIO_EXTENSIONS[ext] || "audio/mpeg";
}

export async function POST(request: NextRequest) {
  try {
    const userId = getVerifiedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication is required for transcription." },
        { status: 401 },
      );
    }
    const quota = consumeStudyAiQuota({
      key: `transcribe:${userId}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!quota.allowed) {
      return NextResponse.json(
        { success: false, error: `Transcription rate limit reached. Try again in ${quota.retryAfterSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(quota.retryAfterSeconds) } },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Transcription service is not configured." },
        { status: 503 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data." },
        { status: 400 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No audio file provided." },
        { status: 400 },
      );
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Audio file is too large. Maximum size for transcription is 20 MB (your file: ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
        },
        { status: 400 },
      );
    }

    const mimeType = resolveMimeType(file);
    const audioBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    const model = getGeminiModelName();

    // Use the same Gemini model as Tutor chat and structured generation.
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
                {
                  text: "You are an accurate English lecture transcription service. Transcribe every word spoken in this audio recording exactly as said. Output ONLY the plain transcript text. Do not add commentary, timestamps, speaker labels, or formatting. If there is no speech, respond with: [No speech detected].",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      const errMsg =
        (errBody as { error?: { message?: string } })?.error?.message ||
        `Gemini API error ${geminiRes.status}`;
      console.error("study.transcribe gemini error", errMsg);
      return NextResponse.json(
        { success: false, error: "Transcription failed. Please try again." },
        { status: 502 },
      );
    }

    const geminiBody = (await geminiRes.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };

    const transcript =
      geminiBody?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!transcript || transcript === "[No speech detected]") {
      return NextResponse.json(
        {
          success: false,
          error:
            "No speech was detected in this audio file. Make sure the file contains English speech.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, transcript }, { status: 200 });
  } catch (error) {
    console.error("study.transcribe.POST", error);
    return NextResponse.json(
      {
        success: false,
        error: "Transcription service encountered an error. Please try again.",
      },
      { status: 500 },
    );
  }
}
