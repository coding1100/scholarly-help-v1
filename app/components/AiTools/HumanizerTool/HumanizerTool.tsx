"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  detectorHumanContentShare,
  detectorPrimaryScore,
  type DetectionResponse,
  type DetectSegment,
} from "@/app/components/AiTools/AiDetectorTool/types";
import { useDetectorConfig } from "@/app/components/AiTools/AiDetectorTool/useDetectorConfig";
import { getAccessToken } from "@/app/lib/authSession";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";

type HumanizerTone = "natural" | "simple" | "polished" | "academic" | "custom";
type RewriteIntensity = "normal" | "moderate" | "full";
type HumanizerRegister =
  "academic" | "professional" | "natural" | "personal" | "marketing";
type RegisterSelection = HumanizerRegister | "auto";

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
  register_mode: HumanizerRegister;
  voice_profile_used: boolean;
  quality_score: number;
  quality_issues: string[];
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
  moderate: {
    label: "Moderate",
    description: "Balanced rewrite (recommended)",
  },
  full: {
    label: "Full",
    description: "Substantial restructuring while preserving meaning",
  },
};

const INTENSITY_ORDER: RewriteIntensity[] = ["normal", "moderate", "full"];
const REGISTER_OPTIONS: Array<{
  value: RegisterSelection;
  label: string;
}> = [
  { value: "auto", label: "Auto-detect" },
  { value: "academic", label: "Academic" },
  { value: "professional", label: "Professional" },
  { value: "natural", label: "Natural" },
  { value: "personal", label: "Personal" },
  { value: "marketing", label: "Marketing" },
];

/**
 * Server-scored sentence highlights: renders the segments returned by the shared
 * detector. Only sentences the model is CONFIDENT are AI get a prominent block
 * highlight; "mixed" (borderline) sentences get a subtle underline instead of a full
 * tint, so an uncertain document — where the model bunches most sentences in the
 * middle band — no longer reads as if every sentence were flagged. When nothing is
 * decisively AI, the caller shows an empty-state instead of this paragraph, so the
 * highlights stay consistent with an uncertain headline score.
 */
function SentenceHighlightedText({ segments }: { segments: DetectSegment[] }) {
  return (
    <p className="leading-relaxed text-gray-800 dark:text-gray-100 text-sm whitespace-pre-wrap">
      {segments.map((seg, i) => {
        const title = `${seg.label} · ${Math.round(seg.prob_ai * 100)}% AI likelihood`;
        if (seg.label === "ai") {
          return (
            <span key={i}>
              <mark
                className="bg-red-100 text-gray-900 dark:bg-red-400/40 dark:text-gray-100 rounded-sm"
                title={title}
              >
                {seg.text}
              </mark>{" "}
            </span>
          );
        }
        if (seg.label === "mixed") {
          // Subtle: a dotted amber underline marks borderline sentences without
          // painting the whole document. Reads as "worth a look", not "flagged".
          return (
            <span
              key={i}
              className="underline decoration-dotted decoration-amber-400/70 underline-offset-4"
              title={title}
            >
              {seg.text}{" "}
            </span>
          );
        }
        return <span key={i}>{seg.text} </span>;
      })}
    </p>
  );
}

/** Shape returned by POST /tools/humanizer/jobs and GET /tools/humanizer/jobs/:id. */
type HumanizerJobResponse = {
  job_id: string;
  status:
    | "queued"
    | "processing"
    | "finalizing"
    | "completed"
    | "failed"
    | "cancelled";
  progress: number;
  result: HumanizerResponse | null;
  error: string | null;
};

/** The API wraps responses as { success, message, data } on some routes. */
function unwrapData<T>(payload: unknown): T {
  return (
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: T }).data
      : payload
  ) as T;
}

const HumanizerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const tone: HumanizerTone = "natural";
  const [intensity, setIntensity] = useState<RewriteIntensity>("moderate");
  const [register, setRegister] = useState<RegisterSelection>("auto");
  const [voiceSample, setVoiceSample] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizerResponse | null>(null);
  const jobRef = useRef<{ id: string; controller: AbortController } | null>(null);
  useEffect(() => () => jobRef.current?.controller.abort(), []);
  const [activePanel, setActivePanel] = useState<"humanized" | "ai_detection">(
    "humanized",
  );
  const [aiDetection, setAiDetection] = useState<AiDetectionState | null>(null);
  const [aiDetectView, setAiDetectView] = useState<"score" | "highlights">(
    "score",
  );
  const [copied, setCopied] = useState(false);
  const detectorConfig = useDetectorConfig();

  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
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
        // ASYNC JOB + POLL. A full humanize run is 30-70s, which is longer than
        // the API gateway's read timeout — the old synchronous POST returned
        // 504 Gateway Time-out. We now create a job (returns in ms) and poll it
        // until it finishes, so no connection is held open for the whole run.
        //
        // `loading` deliberately stays true for the ENTIRE poll: it is only
        // cleared in the finally below, once the job reaches a terminal state.
        // The user therefore sees one continuous loader, never a flash back to
        // the idle state between the create call and the first poll.
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Guests (no token) are allowed; the backend accepts guest requests and
        // the click gate above enforces the free allowance.
        const createResponse = await axios.post<
          HumanizerJobResponse | { data?: HumanizerJobResponse }
        >(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs`,
          {
            text,
            tone_mode: tone,
            rewrite_intensity: intensity,
            ...(register !== "auto" ? { register_mode: register } : {}),
            ...(voiceSample.trim() ? { voice_sample: voiceSample.trim() } : {}),
            preserve_citations: true,
            return_diff: true,
          },
          { headers },
        );

        const createdJob = unwrapData<HumanizerJobResponse>(
          createResponse.data,
        );
        if (!createdJob?.job_id) {
          throw new Error("Humanizer did not return a job id.");
        }

        const controller = new AbortController();
        jobRef.current?.controller.abort();
        jobRef.current = { id: createdJob.job_id, controller };
        const humanizerResult = await waitForJob<HumanizerResponse>({
          eventsUrl: `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs/${createdJob.job_id}/events`,
          pollUrl: `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs/${createdJob.job_id}`,
          headers, signal: controller.signal,
          parse: (payload) => {
            const job = unwrapData<HumanizerJobResponse>(payload);
            return { ...job, result: job.result ?? undefined, error: job.error ?? undefined };
          },
        });
        jobRef.current = null;
        setResult(humanizerResult);
        toast.success("Humanized successfully!");
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.name === "CanceledError") return;
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
    if (wordCount < detectorConfig.minimum_words) {
      toast.error(
        `Please provide at least ${detectorConfig.minimum_words} words — detection on very short text is unreliable.`,
      );
      return;
    }
    if (wordCount > detectorConfig.maximum_words) {
      toast.error(
        `Please keep input at or under ${detectorConfig.maximum_words} words.`,
      );
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
        const result = (response.data?.data ??
          response.data) as DetectionResponse;
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

  const canCheckAi =
    text.trim().length > 0 &&
    wordCount <= detectorConfig.maximum_words &&
    !loading;

  const detection = aiDetection?.success ? aiDetection.result : null;
  const aiPercent = detection ? detectorPrimaryScore(detection) : 0;
  const humanPercent = detection ? detectorHumanContentShare(detection) : 0;
  const aiHeadline = detection
    ? `${aiPercent}% AI-like content detected`
    : "AI detection result will appear here...";
  const detectionSummary = detection
    ? aiPercent < 35
      ? "This text reads as humanized"
      : aiPercent < 65
        ? "This text contains mixed writing patterns"
        : "This text contains predominantly AI-like writing patterns"
    : "";

  return (
    <div className="container relative mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={loading} />

      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
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
              Please remember that AI detection is not 100% accurate; use this
              as a creative assistant for drafting and refining your work.
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

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                Writing type
                <select
                  value={register}
                  onChange={(event) =>
                    setRegister(event.target.value as RegisterSelection)
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-normal text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  {REGISTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                Your voice sample
                <textarea
                  value={voiceSample}
                  onChange={(event) => setVoiceSample(event.target.value)}
                  maxLength={12000}
                  rows={2}
                  placeholder="Optional: paste a short sample of your own writing"
                  className="mt-1 block w-full resize-y rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-normal text-gray-800 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>
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
          {loading && jobRef.current && <button type="button" className="mx-4 mb-3 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700" onClick={() => {
            const job = jobRef.current; if (!job) return; job.controller.abort(); jobRef.current = null; setLoading(false);
            void cancelJob(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs/${job.id}`, { Authorization: `Bearer ${token}` }).catch(() => undefined);
          }}>Cancel humanizing</button>}
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-gray-800 border border-t-0 md:border-t md:border-l-0 border-gray-300 dark:border-gray-700 min-w-0 h-auto flex flex-col justify-between transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {activePanel === "ai_detection"
                ? "AI Detection"
                : "Humanized Text"}
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
                  <>
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                        Quality {result?.quality_score}/100
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {result?.register_mode}
                      </span>
                      {result?.voice_profile_used && (
                        <span className="rounded-full bg-violet-50 px-2 py-1 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
                          Voice matched
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-sm text-gray-800 dark:text-gray-100">
                      {rewrittenText}
                    </p>
                    <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                      <strong>What changed:</strong> {result?.quality_issues?.length ? result.quality_issues.join("; ") : `Adjusted sentence structure and word choice using ${result?.rewrite_intensity} intensity while ${result?.citations_preserved ? "preserving" : "reviewing"} citations.`}
                    </div>
                  </>
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
                    {detection && (
                      <div className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {detectionSummary}
                      </div>
                    )}
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" />
                          <span className="text-gray-700 dark:text-gray-200">
                            AI-like content
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
                            Human-like content
                          </span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">
                          {humanPercent}%
                        </span>
                      </div>
                      {detection && (
                        <div className="space-y-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="space-y-1 border-t border-gray-200 pt-2 dark:border-gray-700">
                            <div className="font-medium">
                              Estimated composition by analyzed words
                            </div>
                            <div className="flex justify-between">
                              <span>AI-like words</span>
                              <span>{detection.breakdown.ai}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mixed or uncertain words</span>
                              <span>{detection.breakdown.mixed}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Human-like words</span>
                              <span>{detection.breakdown.human}%</span>
                            </div>
                          </div>
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3 w-4 rounded-sm bg-red-100 dark:bg-red-400/40 flex-shrink-0" />
                        AI-likely sentences
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3 w-4 border-b-2 border-dotted border-amber-400/70 flex-shrink-0" />
                        Borderline sentences
                      </span>
                    </div>
                    {!(detection.segments ?? []).some(
                      (s) => s.label === "ai",
                    ) && (
                      <div className="rounded-md bg-gray-50 dark:bg-gray-700/40 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        No sentences stood out as clearly AI-generated. The
                        detector is uncertain across this text — borderline
                        sentences are underlined below, but none crossed the AI
                        threshold.
                      </div>
                    )}
                    <SentenceHighlightedText
                      segments={detection.segments ?? []}
                    />
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
