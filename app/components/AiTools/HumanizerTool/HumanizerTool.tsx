"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiCopy, FiCheck } from "react-icons/fi";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import AiGauge from "@/app/components/AiTools/shared/AiGauge";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import {
  type DetectionResponse,
  type DetectSegment,
  MIN_DETECT_WORDS,
} from "@/app/components/AiTools/AiDetectorTool/types";

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

/**
 * Detection state for the "Check AI" panel. Scoring comes entirely from the
 * shared backend detector (POST /tools/ai-detect) — this component renders the
 * result and never scores locally.
 */
type AiDetectionState =
  | { success: true; result: DetectionResponse }
  | { success: false; reason: string };

const INTENSITY_META: Record<
  RewriteIntensity,
  { label: string; description: string }
> = {
  normal: { label: "Normal", description: "Light touch, closest to original" },
  moderate: { label: "Moderate", description: "Balanced rewrite (recommended)" },
  full: { label: "Full", description: "Aggressive rewrite for undetectability" },
};

const INTENSITY_ORDER: RewriteIntensity[] = ["normal", "moderate", "full"];

/**
 * Server-scored sentence highlights: renders the segments returned by the shared
 * detector, marking AI sentences red-tinted and mixed sentences amber-tinted.
 * (The old client-side sentence scorer was deleted — highlights and the gauge now
 * always agree because they come from the same backend response.)
 */
function SentenceHighlightedText({ segments }: { segments: DetectSegment[] }) {
  return (
    <p className="leading-relaxed text-gray-800 dark:text-gray-100 text-sm whitespace-pre-wrap">
      {segments.map((seg, i) => {
        const highlight =
          seg.label === "ai"
            ? "bg-red-100 text-gray-900 dark:bg-red-400/40 dark:text-gray-100"
            : seg.label === "mixed"
              ? "bg-amber-100 text-gray-900 dark:bg-amber-400/40 dark:text-gray-100"
              : "";
        return highlight ? (
          <span key={i}>
            <mark
              className={`${highlight} rounded-sm`}
              title={`${seg.label} · ${Math.round(seg.prob_ai * 100)}% AI likelihood`}
            >
              {seg.text}
            </mark>{" "}
          </span>
        ) : (
          <span key={i}>{seg.text} </span>
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
  const [activePanel, setActivePanel] = useState<"humanized" | "ai_detection">(
    "humanized",
  );
  const [aiDetection, setAiDetection] = useState<AiDetectionState | null>(
    null,
  );
  const [aiDetectView, setAiDetectView] = useState<"score" | "highlights">(
    "score",
  );
  const [copied, setCopied] = useState(false);

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

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
    setAiDetection(null);
    setActivePanel("humanized");
    setAiDetectView("score");
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy.");
    }
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
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

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      setLoading(true);
      setResult(null);
      setAiDetection(null);
      setActivePanel("humanized");
      trackToolGenerate({ toolName: "Humanizer Tool" });

      try {
        // Guests (no token) are allowed; the backend accepts guest requests and
        // the click gate above enforces the free allowance.
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
    });
  };

  const handleCheckAi = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (wordCount < MIN_DETECT_WORDS) {
      toast.error(
        `Please provide at least ${MIN_DETECT_WORDS} words — detection on very short text is unreliable.`,
      );
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

    // Same guest allowance as humanizing: detection is a billed AI action now
    // that it runs through the shared backend detector.
    guardAiClick(async () => {
      setLoading(true);
      setAiDetection(null);
      setActivePanel("ai_detection");
      setAiDetectView("score");

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect`,
          {
            text,
            options: { include_segments: true, include_signals: true },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        // Backend wraps responses as { success, message, data }
        const result = (response.data?.data ?? response.data) as DetectionResponse;
        setAiDetection({ success: true, result });
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to check AI.";
        toast.error(
          Array.isArray(message) ? message.join(", ") : String(message),
        );
        setAiDetection({ success: false, reason: String(message) });
      } finally {
        setLoading(false);
      }
    });
  };

  const canCheckAi = text.trim().length > 0 && wordCount <= 1500 && !loading;

  const detection = aiDetection?.success ? aiDetection.result : null;
  const aiPercent = detection ? detection.verdict.ai_percent : 0;
  const aiHeadline = detection
    ? `${aiPercent}% of this text appears to be AI-generated`
    : "AI detection result will appear here...";

  return (
    <div className="container relative mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={loading} />

      <div
        className="grid grid-cols-1 md:grid-cols-2 items-stretch"
      >
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 min-w-0 h-auto flex flex-col transition-colors duration-300">
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
        <div className="bg-white dark:bg-gray-800 border border-t-0 md:border-t md:border-l-0 border-gray-300 dark:border-gray-700 min-w-0 h-auto flex flex-col justify-between transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {activePanel === "ai_detection" ? "AI Detection" : "Humanized Text"}
            </h2>

            {activePanel === "humanized" && rewrittenText && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy humanized text"}
                title={copied ? "Copied!" : "Copy"}
                className="flex-shrink-0 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff] transition-colors duration-150"
              >
                {copied ? (
                  <FiCheck className="h-4 w-4 text-emerald-500" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-[12rem]">
            {activePanel === "humanized" ? (
              /* Humanized text */
              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    In process...
                  </p>
                ) : rewrittenText ? (
                  <p className="whitespace-pre-wrap break-words leading-relaxed text-sm text-gray-800 dark:text-gray-100">
                    {rewrittenText}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Result will appear here...
                  </p>
                )}
              </div>
            ) : (
              /* AI Detection */
              <div className="flex-1 flex flex-col">
                {/* Score / Highlights toggle */}
                {aiDetection?.success && (
                  <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
                    {(["score", "highlights"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAiDetectView(v)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
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
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center text-gray-800 dark:text-gray-100">
                      <div className="text-base sm:text-lg font-semibold text-balance">
                        {aiHeadline}
                      </div>
                    </div>
                    <div className="mt-6 mb-6">
                      <AiGauge percent={aiPercent} colorByScore />
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
                      {detection && (
                        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                          Likely range {detection.verdict.band[0]}–
                          {detection.verdict.band[1]}% · {detection.trust.reason}
                        </div>
                      )}
                      {aiDetection && !aiDetection.success && (
                        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                          {aiDetection.reason}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Highlights view */}
                {aiDetectView === "highlights" && detection && (
                  <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="inline-block h-3 w-4 rounded-sm bg-red-100 dark:bg-red-400/40 flex-shrink-0" />
                      AI-likely sentences
                      <span className="inline-block h-3 w-4 rounded-sm bg-amber-100 dark:bg-amber-400/40 flex-shrink-0" />
                      Mixed sentences
                    </div>
                    <SentenceHighlightedText segments={detection.segments ?? []} />
                  </div>
                )}
              </div>
            )}
          </div>

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
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default HumanizerTool;
