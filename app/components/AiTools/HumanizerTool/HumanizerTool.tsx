"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegCopy } from "react-icons/fa";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import ResultDisplay from "@/app/components/AiTools/ResultDisplay";
import { countWords } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

type HumanizerTone = "natural" | "simple" | "polished" | "academic" | "custom";
type RewriteIntensity = "normal" | "moderate" | "full";

type DiffSegment = {
  type: "equal" | "insert" | "delete";
  value: string;
};

type HumanizerResponse = {
  status: "success";
  original_text: string;
  rewritten_text: string;
  tone_mode: HumanizerTone;
  rewrite_intensity: RewriteIntensity;
  diff: DiffSegment[] | null;
  citations_preserved: boolean;
  citation_count: number;
  llm_used: string;
  tokens_used: number;
};

type AiDetectionMeta = {
  matchedTells?: string[];
  signals?: { id: string; label: string; direction: "ai" | "human" }[];
  details?: Record<string, unknown>;
};

type AiDetectionResponse = {
  success: boolean;
  aiPercent: number;
  humanPercent: number;
  reason?: string;
  meta?: AiDetectionMeta;
};

const INTENSITY_META: Record<
  RewriteIntensity,
  { label: string; description: string }
> = {
  normal: { label: "Normal", description: "Light touch, closest to original" },
  moderate: { label: "Moderate", description: "Balanced rewrite (recommended)" },
  full: { label: "Full", description: "Aggressive rewrite for undetectability" },
};

const INTENSITY_ORDER: RewriteIntensity[] = ["normal", "moderate", "full"];

function AiGauge({ percent }: { percent: number }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;
  const gap = c - dash;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-emerald-500"
          stroke="currentColor"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl font-semibold text-gray-800 dark:text-gray-100">
          {clamped}%
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sentence-level AI scorer (client-side, no extra API call)
// Mirrors the key signals from heuristic-detector.ts but applied per-sentence
// relative to the full passage context so scores are calibrated.
// ---------------------------------------------------------------------------
const AI_TELLS = [
  "moreover","furthermore","additionally","therefore","consequently","thus",
  "hence","however","notably","overall","nonetheless","nevertheless",
  "subsequently","accordingly","henceforth","in conclusion","in summary",
  "as a result","in addition","on the other hand","it is important to note",
  "it is worth noting","delve","tapestry","leverage","robust","seamless",
  "cutting-edge","transformative","utilize","groundbreaking","unlock",
  "testament","underscore","underscores","realm","vibrant","intricate",
  "intricacies","pivotal","showcase","showcasing","interplay","landscape",
  "foster","fostering","garner","enduring","navigate the","when it comes to",
  "plays a crucial role","plays a vital role","a testament to","in the realm of",
];

// Heuristic check for gibberish / non-language input (e.g. random keyboard
// mashing like "NBVGFDXZS..."). Humanizing or AI-checking such input is
// meaningless, so we reject it up front. A token is "plausible" if it contains a
// vowel and has no absurdly long consonant run. If too few tokens are plausible,
// the input is treated as gibberish.
function looksLikeGibberish(input: string): boolean {
  const tokens = (input.toLowerCase().match(/[a-z]+/g) || []).filter(
    (t) => t.length >= 2,
  );
  // Not enough alphabetic content to judge — let it through.
  if (tokens.length < 3) return false;

  const isPlausible = (t: string) => {
    if (t.length > 18) return false; // real words are rarely this long
    if (!/[aeiou]/.test(t)) return false; // a word with no vowel is unlikely
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(t)) return false; // 5+ consonants in a row
    return true;
  };

  const plausible = tokens.filter(isPlausible).length;
  const ratio = plausible / tokens.length;
  // Fewer than half the tokens look like real words → gibberish.
  return ratio < 0.5;
}

function scoreSentenceAi(sentence: string): number {
  const lower = sentence.toLowerCase();
  const words = lower.match(/[a-z0-9']+/g) || [];
  if (words.length < 4) return 0;

  let score = 0;

  // AI-tell vocabulary
  for (const tell of AI_TELLS) {
    if (lower.includes(tell)) score += 0.35;
  }

  // Long formal words
  const longWordRatio = words.filter((w) => w.length >= 8).length / words.length;
  if (longWordRatio > 0.28) score += 0.25;

  // No contractions
  const hasContraction = /\b\w+'\w+\b/.test(sentence);
  if (!hasContraction) score += 0.15;

  // No first person
  const hasFirstPerson = /\b(i|me|my|we|our|us)\b/i.test(sentence);
  if (!hasFirstPerson) score += 0.1;

  // Mid-length cadence (10–28 words is typical AI range)
  if (words.length >= 10 && words.length <= 28) score += 0.15;

  return Math.min(score, 1);
}

function splitSentences(text: string): { sentence: string; gap: string }[] {
  // Split on sentence boundaries, preserving the whitespace/newline between them
  const parts: { sentence: string; gap: string }[] = [];
  const re = /([^.!?\n]+[.!?]*)(\s*\n*\s*)/g;
  let match: RegExpExecArray | null;
  let last = 0;
  while ((match = re.exec(text)) !== null) {
    parts.push({ sentence: match[1], gap: match[2] });
    last = match.index + match[0].length;
  }
  // Any trailing text without punctuation
  if (last < text.length) {
    parts.push({ sentence: text.slice(last), gap: "" });
  }
  return parts.filter((p) => p.sentence.trim());
}

function SentenceHighlightedText({ text }: { text: string }) {
  const sentences = splitSentences(text);
  // Threshold: highlight if score >= 0.4
  const THRESHOLD = 0.4;

  return (
    <p className="leading-relaxed text-gray-800 dark:text-gray-100 text-sm whitespace-pre-wrap">
      {sentences.map(({ sentence, gap }, i) => {
        const score = scoreSentenceAi(sentence);
        return score >= THRESHOLD ? (
          <span key={i}>
            <mark
              className="bg-yellow-300 text-gray-900 dark:bg-yellow-400/70 dark:text-gray-900 rounded-sm"
              title={`AI likelihood: ${Math.round(score * 100)}%`}
            >
              {sentence}
            </mark>
            {gap}
          </span>
        ) : (
          <span key={i}>{sentence}{gap}</span>
        );
      })}
    </p>
  );
}

const HumanizerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const tone: HumanizerTone = "natural";
  const [intensity, setIntensity] = useState<RewriteIntensity>("moderate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizerResponse | null>(null);
  const [resultView, setResultView] = useState<"humanized" | "changes">(
    "humanized",
  );
  const [activePanel, setActivePanel] = useState<"humanized" | "ai_detection">(
    "humanized",
  );
  const [aiDetection, setAiDetection] = useState<AiDetectionResponse | null>(
    null,
  );
  const [aiDetectView, setAiDetectView] = useState<"score" | "highlights">(
    "score",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const wordCount = useMemo(() => countWords(text), [text]);
  const canSubmit = text.trim().length > 0 && wordCount <= 1500 && !loading;

  const rewrittenText = result?.rewritten_text || "";

  const handleClear = () => {
    setText("");
    setResult(null);
    setResultView("humanized");
    setAiDetection(null);
    setActivePanel("humanized");
    setAiDetectView("score");
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy.");
    }
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    setResult(null);
    setResultView("humanized");
    try {
      if (!token) throw new Error("Access token not found");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Backend wraps responses as { success, message, data }
      const responseData = response.data?.data ?? response.data;
      const extracted = String(responseData || "").trim();
      setText(extracted);

      if (countWords(extracted) > 1500) {
        toast.error(
          "This document is over 1500 words. Please trim it before humanizing.",
        );
      } else {
        toast.success("Document text extracted.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to parse document.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (wordCount > 1500) {
      toast.error("Please keep input at or under 1500 words.");
      return;
    }
    if (looksLikeGibberish(text)) {
      toast.error(
        "This doesn't look like readable text. Please enter meaningful content to humanize.",
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setResultView("humanized");
    setAiDetection(null);
    setActivePanel("humanized");
    trackToolGenerate({ toolName: "Humanizer Tool" });

    try {
      if (!token) throw new Error("Access token not found");

      const response = await axios.post<
        HumanizerResponse | { data?: HumanizerResponse }
      >(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer`,
        {
          text,
          tone_mode: tone,
          rewrite_intensity: intensity,
          preserve_citations: true,
          return_diff: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Backend wraps responses as { success, message, data }
      const humanizerResult = (
        response.data && typeof response.data === "object" && "data" in response.data
          ? (response.data as { data?: HumanizerResponse }).data
          : response.data
      ) as HumanizerResponse;
      setResult(humanizerResult);
      toast.success("Humanized successfully!");
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to humanize text.";

      if (status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (status === 403) {
        toast.error(
          "You don’t have enough token balance, or the input exceeds limits.",
        );
      } else {
        toast.error(
          Array.isArray(message) ? message.join(", ") : String(message),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAi = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (wordCount > 1500) {
      toast.error("Please keep input at or under 1500 words.");
      return;
    }
    if (looksLikeGibberish(text)) {
      toast.error(
        "This doesn't look like readable text. Please enter meaningful content to check.",
      );
      return;
    }

    setLoading(true);
    setAiDetection(null);
    setActivePanel("ai_detection");
    setAiDetectView("score");

    try {
      const response = await axios.post<AiDetectionResponse>("/api/ai-detect", {
        text,
      });
      setAiDetection(response.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to check AI.";
      toast.error(Array.isArray(message) ? message.join(", ") : String(message));
      setAiDetection({
        success: false,
        aiPercent: 0,
        humanPercent: 0,
        reason: String(message),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseThisVersion = () => {
    if (!rewrittenText) return;
    setText(rewrittenText);
    toast.success("Loaded into editor.");
  };

  const canCheckAi = text.trim().length > 0 && wordCount <= 1500 && !loading;

  const aiPercent = Math.max(
    0,
    Math.min(100, Math.round(aiDetection?.aiPercent ?? 0)),
  );
  const humanPercent = Math.max(
    0,
    Math.min(100, Math.round(aiDetection?.humanPercent ?? 0)),
  );
  const aiHeadline =
    aiDetection && aiDetection.success
      ? `${aiPercent}% of this text appears to be AI-generated`
      : "AI detection result will appear here...";

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={loading} />

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ alignItems: "stretch" }}
      >
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col transition-colors duration-300">
          <TextSummarizerInput
            title="AI Humanizer"
            onTextChange={(t) => setText(t)}
            onFileUpload={handleUploadDocument}
            initialText={text}
            placeholder="Paste your text here..."
            maxWords={1500}
            accept=".pdf,.docx,.txt"
          />

          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Makes text sound more natural, removes buzzwords, and keeps
              language simple.
            </p>

            {/* Disclaimer */}
            <p className="rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Disclaimer: This tool is designed to enhance your writing style.
              Please remember that AI detection is not 100% accurate; use this as
              a creative assistant for drafting and refining your work.
            </p>

            {/* Rewrite intensity */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100">
                Rewrite intensity:
              </label>
              <div className="flex gap-2">
                {INTENSITY_ORDER.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    className={`flex-1 px-2 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
                      intensity === level
                        ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff]"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {INTENSITY_META[level].label}
                  </button>
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {INTENSITY_META[intensity].description}
              </div>
            </div>

            {wordCount > 1500 && (
              <div className="text-xs font-semibold text-[#fb2c36] dark:text-red-400">
                Word limit exceeded: {wordCount}/1500. Please trim before
                submitting.
              </div>
            )}
          </div>

          <ActionButtons
            onClear={handleClear}
            onSubmit={handleHumanize}
            submitButtonText="Humanize"
            secondaryButtonText="Check AI"
            onSecondarySubmit={handleCheckAi}
            isSubmitting={loading}
            isDisabled={!canSubmit}
            isSecondaryDisabled={!canCheckAi}
          />
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col justify-between transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="flex gap-2">
              {(["humanized", "changes"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setResultView(view)}
                  disabled={!result || activePanel !== "humanized"}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
                    !result || activePanel !== "humanized"
                      ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : resultView === view
                        ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff]"
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {view === "humanized" ? "Humanized" : "Changes"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopy(rewrittenText)}
                disabled={!rewrittenText || activePanel !== "humanized"}
                className={`px-3 py-2 border rounded-md flex items-center gap-2 transition-colors duration-300 ${
                  !rewrittenText || activePanel !== "humanized"
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <FaRegCopy />
                Copy
              </button>
              <button
                type="button"
                onClick={handleUseThisVersion}
                disabled={!rewrittenText || activePanel !== "humanized"}
                className={`px-3 py-2 rounded-md text-white transition-colors duration-300 ${
                  !rewrittenText || activePanel !== "humanized"
                    ? "bg-primary-400/60 cursor-not-allowed"
                    : "bg-primary-400 hover:bg-primary-300"
                }`}
              >
                Use this version
              </button>
            </div>
          </div>

          <ResultDisplay
            title={
              activePanel === "ai_detection"
                ? "AI Detection"
                : resultView === "changes"
                  ? "Changes"
                  : "Humanized Text"
            }
            resultText={
              activePanel === "humanized" && resultView === "humanized"
                ? rewrittenText
                : ""
            }
            loading={loading}
            customBody={
              activePanel === "humanized" && resultView === "changes" ? (
                result?.diff && result.diff.length > 0 ? (
                  <div className="w-full whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-100 p-1">
                    {result.diff.map((seg, i) => {
                      if (seg.type === "insert") {
                        return (
                          <span
                            key={i}
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-sm"
                          >
                            {seg.value}
                          </span>
                        );
                      }
                      if (seg.type === "delete") {
                        return (
                          <span
                            key={i}
                            className="bg-red-100 text-red-700 line-through dark:bg-red-900/40 dark:text-red-300 rounded-sm"
                          >
                            {seg.value}
                          </span>
                        );
                      }
                      return <span key={i}>{seg.value}</span>;
                    })}
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    No change tracking available for this result.
                  </div>
                )
              ) : activePanel === "ai_detection" ? (
                <div className="h-full w-full flex flex-col">
                  {/* View toggle */}
                  {aiDetection?.success && (
                    <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
                      {(["score", "highlights"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAiDetectView(v)}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
                            aiDetectView === v
                              ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff]"
                              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {v === "score" ? "Score" : "Highlights"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Score view */}
                  {aiDetectView === "score" && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="text-center text-gray-800 dark:text-gray-100">
                        <div className="text-lg font-semibold">{aiHeadline}</div>
                      </div>
                      <div className="mt-6 mb-6">
                        <AiGauge percent={aiPercent} />
                      </div>
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" />
                            <span className="text-gray-700 dark:text-gray-200">
                              Resembles AI text
                            </span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">
                            {aiPercent}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                            <span className="text-gray-700 dark:text-gray-200">
                              No AI text patterns found
                            </span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200">
                            {Math.max(0, 100 - aiPercent)}%
                          </span>
                        </div>
                        {aiDetection?.reason && !aiDetection.success && (
                          <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                            {aiDetection.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlights view */}
                  {aiDetectView === "highlights" && (
                    <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
                      {/* Legend */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="inline-block h-3 w-4 rounded-sm bg-yellow-300 dark:bg-yellow-400/70 flex-shrink-0" />
                        Sentences likely written by AI are highlighted
                      </div>
                      <SentenceHighlightedText text={text} />
                    </div>
                  )}
                </div>
              ) : undefined
            }
          />

          {result && (
            <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              {result.citations_preserved && result.citation_count > 0 && (
                <div className="mb-1 text-emerald-600 dark:text-emerald-400">
                  Citations preserved ({result.citation_count})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanizerTool;
