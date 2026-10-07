"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiChevronDown, FiDownload, FiEdit3 } from "react-icons/fi";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import AiGauge from "@/app/components/AiTools/shared/AiGauge";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { useToolDraftPersistence } from "@/app/lib/client/useToolDraftPersistence";
import { useBillingDraftStash } from "@/app/lib/client/useBillingDraftStash";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import {
  detectorHumanContentShare,
  detectorPrimaryScore,
  type DetectionResponse,
  type DetectSegment,
} from "@/app/components/AiTools/AiDetectorTool/types";
import { useDetectorConfig } from "@/app/components/AiTools/AiDetectorTool/useDetectorConfig";
import { useHumanizerConfig } from "@/app/components/AiTools/HumanizerTool/useHumanizerConfig";
import { fetchWithAuthRetry, getAccessToken } from "@/app/lib/authSession";
import { recordToolRun } from "@/app/utils/toolHistoryClient";
import { cancelJob, waitForJob } from "@/app/lib/client/jobStream";
import {
  dispatchBillingGateEvent,
  isBillingGateError,
  isBillingGateResponseBody,
} from "@/app/lib/client/billingGateCodes";
// Cross-tool document sync store
import { useDocumentStore } from "@/app/lib/client/useDocumentStore";
import {
  buildDocxBlob,
  downloadBlob,
  sanitizeFilename,
} from "@/app/components/AiTools/MainTool/academicDocumentExport";

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
 * Detection state for the AI-score badges and the "AI Detection" deep-dive
 * panel. Scoring comes entirely from the shared backend detector
 * (POST /tools/ai-detect) — this component renders the result and never
 * scores locally.
 */
type AiDetectionState =
  | { success: true; result: DetectionResponse }
  | { success: false; reason: string };

/** Which side's detection (original vs. humanized) the score panel is showing. */
type DetectionFocus = "original" | "result";

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
    <p className="leading-relaxed text-gray-800 dark:text-gray-100 text-sm whitespace-pre-wrap break-words">
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

/**
 * Small pill showing a detector score, e.g. "AI score 91%". Color follows the
 * same red/amber/green bands as the detection summary copy below, so a badge
 * and the deep-dive panel it opens never disagree. Clicking it (when a result
 * is available) opens the AI Detection panel focused on that side.
 */
function ScoreBadge({
  state,
  loading,
  onClick,
}: {
  state: AiDetectionState | null;
  loading: boolean;
  onClick?: () => void;
}) {
  if (loading) {
    return (
      <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400 dark:bg-gray-700 dark:text-gray-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
        Scoring…
      </span>
    );
  }
  if (!state || !state.success) return null;

  const score = detectorPrimaryScore(state.result);
  const tone =
    score < 35
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
      : score < 65
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-400";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity duration-150 ${tone} ${
        onClick ? "hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]" : "cursor-default"
      }`}
    >
      AI score {score}%
    </button>
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

interface HumanizerToolProps {
  embedded?: boolean;
}

const HumanizerTool: React.FC<HumanizerToolProps> = ({ embedded = false }) => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const tone: HumanizerTone = "natural";
  const [intensity, setIntensity] = useState<RewriteIntensity>("moderate");
  const [register, setRegister] = useState<RegisterSelection>("auto");
  const [voiceSample, setVoiceSample] = useState("");
  // Both "+ Add your writing sample" and "More options" reveal the SAME
  // combined panel (writing sample textarea + writing type dropdown) — the
  // design opens them together as one expand, not two independent ones.
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<HumanizerResponse | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const jobRef = useRef<{ id: string; controller: AbortController } | null>(null);
  useEffect(() => () => jobRef.current?.controller.abort(), []);
  const [activePanel, setActivePanel] = useState<"humanized" | "ai_detection">(
    "humanized",
  );
  const [detectionFocus, setDetectionFocus] = useState<DetectionFocus>("result");
  const [originalDetection, setOriginalDetection] =
    useState<AiDetectionState | null>(null);
  const [resultDetection, setResultDetection] =
    useState<AiDetectionState | null>(null);
  const [scoringOriginal, setScoringOriginal] = useState(false);
  const [scoringResult, setScoringResult] = useState(false);
  const [aiDetectView, setAiDetectView] = useState<"score" | "highlights">(
    "score",
  );
  const detectorConfig = useDetectorConfig();

  type HumanizerDraft = {
    text: string;
    intensity: RewriteIntensity;
    register: RegisterSelection;
    voiceSample: string;
  };
  const { stashDraft } = useToolDraftPersistence<HumanizerDraft>(
    "humanizer",
    (draft) => {
      if (draft.text) setText(draft.text);
      if (draft.intensity) setIntensity(draft.intensity);
      if (draft.register) setRegister(draft.register);
      if (draft.voiceSample) setVoiceSample(draft.voiceSample);
    },
  );

  useBillingDraftStash<HumanizerDraft>("humanizer", () => ({
    text,
    intensity,
    register,
    voiceSample,
  }));

  const activeDocText = useDocumentStore((state) => state.activeText);
  const sourceTool = useDocumentStore((state) => state.sourceTool);
  const clearDocument = useDocumentStore((state) => state.clearDocument);

  // Consumes handed-off draft and clears shared store to prevent ghost fills
  useEffect(() => {
    if (!activeDocText) return;
    const shouldLoad = !text.trim() || sourceTool === "essay_studio";
    if (shouldLoad) {
      setText(activeDocText);
      toast.success(
        `Draft loaded from ${sourceTool === "essay_studio" ? "Essay Studio" : "workspace"}`,
      );
    }
    clearDocument();
  }, [activeDocText, text, sourceTool, clearDocument]);

  const { gateOpen, openGate, closeGate, guardAiClick } =
    useGuestGate<HumanizerDraft>({
      getDraft: () => ({ text, intensity, register, voiceSample }),
      stashDraft,
    });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
    }
  }, []);

  const { maxWords } = useHumanizerConfig();
  const wordCount = useMemo(() => countWords(text), [text]);
  const canSubmit = text.trim().length > 0 && wordCount <= maxWords && !loading;

  const rewrittenText = result?.rewritten_text || "";

  const handleClear = () => {
    setText("");
    setStreamingText("");
    setResult(null);
    setOriginalDetection(null);
    setResultDetection(null);
    setActivePanel("humanized");
    setAiDetectView("score");
    setShowMoreOptions(false);
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
      toast.success("Copied to clipboard.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy.");
    }
  };

  const handleDownloadDocx = async () => {
    if (!rewrittenText) return;
    setDownloading(true);
    try {
      const escaped = rewrittenText
        .split(/\n{2,}/)
        .map(
          (para) =>
            `<p>${para
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br/>")}</p>`,
        )
        .join("");
      const blob = await buildDocxBlob(escaped, "Humanized Text");
      downloadBlob(blob, `${sanitizeFilename("humanized-text")}.docx`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to build the .docx file.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    setStreamingText("");
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

      if (countWords(extracted) > maxWords) {
        toast.error(
          `This document is over ${maxWords} words. Please trim it before humanizing.`,
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

  /**
   * Scores a single piece of text against the shared detector. Used for the
   * automatic "AI score" badges on both panels — these ride along on the ONE
   * guest click already spent on Humanize (no extra allowance consumed) and
   * fail silently, since scoring is a bonus on top of the rewrite, not a
   * user-initiated action of its own.
   */
  const runDetection = useCallback(
    async (input: string): Promise<AiDetectionState> => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect`,
          { text: input, options: { include_segments: true, include_signals: true } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const detectionResult = (response.data?.data ??
          response.data) as DetectionResponse;
        return { success: true, result: detectionResult };
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to check AI.";
        return { success: false, reason: String(message) };
      }
    },
    [token],
  );

  /**
   * Scores both sides in the background once a humanize run completes, then
   * records the run for the dashboard's "Recent work" panel.
   *
   * The history row is written twice on purpose: once as soon as the rewrite
   * lands (so the run is never lost if scoring is skipped or fails), then
   * again with the before/after scores once both detections settle. The
   * backend dedupes on user + tool + title inside a 6h window, so the second
   * write updates the same row rather than adding one.
   */
  const scoreBothSides = useCallback(
    (originalText: string, humanizedText: string) => {
      const historyBase = {
        toolKey: "humanizer",
        toolName: "Humanizer",
        href: "/tools/humanizer-tool",
        title: originalText,
      };
      void recordToolRun(historyBase);

      const scoreSide = (
        input: string,
        apply: (state: AiDetectionState | null) => void,
        setPending: (pending: boolean) => void,
      ): Promise<AiDetectionState | null> => {
        const words = countWords(input);
        if (
          words < detectorConfig.minimum_words ||
          words > detectorConfig.maximum_words
        ) {
          apply(null);
          return Promise.resolve(null);
        }
        setPending(true);
        return runDetection(input)
          .then((state) => {
            apply(state);
            return state;
          })
          .finally(() => setPending(false));
      };

      const originalScore = scoreSide(
        originalText,
        setOriginalDetection,
        setScoringOriginal,
      );
      const resultScore = scoreSide(
        humanizedText,
        setResultDetection,
        setScoringResult,
      );

      void Promise.all([originalScore, resultScore]).then(([from, to]) => {
        const after = to?.success ? detectorPrimaryScore(to.result) : undefined;
        // No "after" score means there is nothing to add beyond the row that
        // was already written above.
        if (typeof after !== "number") return;
        void recordToolRun({
          ...historyBase,
          metricLabel: "AI score",
          metricBefore: from?.success
            ? detectorPrimaryScore(from.result)
            : undefined,
          metricAfter: after,
        });
      });
    },
    [detectorConfig.minimum_words, detectorConfig.maximum_words, runDetection],
  );

  const runHumanize = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    if (wordCount > maxWords) {
      toast.error(`Please keep input at or under ${maxWords} words.`);
      return;
    }
    if (looksLikeGibberish(text)) {
      toast.error(
        "This doesn't look like readable text. Please enter meaningful content to humanize.",
      );
      return;
    }

    setLoading(true);
    setStreamingText("");
    setResult(null);
    setOriginalDetection(null);
    setResultDetection(null);
    setActivePanel("humanized");
    trackToolGenerate({ toolName: "Humanizer Tool" });

    const submittedText = text;
    const controller = new AbortController();
    jobRef.current?.controller.abort();
    jobRef.current = { id: "stream", controller };

    const payload = {
      text,
      tone_mode: tone,
      rewrite_intensity: intensity,
      ...(register !== "auto" ? { register_mode: register } : {}),
      ...(voiceSample.trim() ? { voice_sample: voiceSample.trim() } : {}),
      preserve_citations: true,
      return_diff: true,
    };

    try {
      let accumulatedText = "";

      // Stream rewritten tokens via SSE endpoint with real-time UI updates
      try {
        const streamResponse = await fetchWithAuthRetry(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/stream`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
        );

        if (streamResponse.status === 401) {
          toast.error("Session expired. Please sign in again.");
          return;
        }

        if (streamResponse.status === 403) {
          const body = await streamResponse.json().catch(() => null);
          if (isBillingGateResponseBody(streamResponse.status, body)) {
            dispatchBillingGateEvent();
          } else {
            toast.error(
              body?.message ||
                "You don’t have enough token balance, or the input exceeds limits.",
            );
          }
          return;
        }

        if (streamResponse.status === 400) {
          const body = await streamResponse.json().catch(() => null);
          toast.error(body?.message || "Validation failed.");
          return;
        }

        if (
          streamResponse.ok &&
          streamResponse.headers.get("content-type")?.includes("text/event-stream") &&
          streamResponse.body
        ) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() ?? "";
            for (const chunk of chunks) {
              for (const line of chunk.split("\n")) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const dataStr = trimmed.slice(5).trim();
                if (!dataStr || dataStr === "[DONE]") continue;
                const parsed = JSON.parse(dataStr);
                if (parsed.error) throw new Error(parsed.error);
                if (typeof parsed.text === "string") {
                  accumulatedText += parsed.text;
                  setStreamingText(accumulatedText);
                }
              }
            }
          }

          if (buffer.trim()) {
            for (const line of buffer.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr || dataStr === "[DONE]") continue;
              const parsed = JSON.parse(dataStr);
              if (parsed.error) throw new Error(parsed.error);
              if (typeof parsed.text === "string") {
                accumulatedText += parsed.text;
                setStreamingText(accumulatedText);
              }
            }
          }

          if (accumulatedText.trim()) {
            const streamResult: HumanizerResponse = {
              status: "success",
              original_text: submittedText,
              rewritten_text: accumulatedText,
              tone_mode: tone,
              rewrite_intensity: intensity,
              diff: null,
              citations_preserved: true,
              citation_count: 0,
              llm_used: "stream",
              tokens_used: 0,
              register_mode:
                register === "auto" ? "natural" : (register as HumanizerRegister),
              voice_profile_used: Boolean(voiceSample.trim()),
              quality_score: 95,
              quality_issues: [],
            };
            setResult(streamResult);
            setStreamingText("");
            toast.success("Humanized successfully!");
            scoreBothSides(submittedText, accumulatedText);
            return;
          }
        }
      } catch (streamErr: any) {
        if (
          streamErr?.name === "AbortError" ||
          streamErr?.name === "CanceledError" ||
          controller.signal.aborted
        ) {
          throw streamErr;
        }
        // Surface error if stream failed after partial delivery rather than rerunning
        if (accumulatedText.length > 0) {
          throw streamErr;
        }
      }

      // Fallback to async job and polling if streaming is unavailable or yielded no tokens
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const createResponse = await axios.post<
        HumanizerJobResponse | { data?: HumanizerJobResponse }
      >(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs`,
        payload,
        { headers, signal: controller.signal },
      );

      const createdJob = unwrapData<HumanizerJobResponse>(createResponse.data);
      if (!createdJob?.job_id) {
        throw new Error("Humanizer did not return a job id.");
      }

      jobRef.current = { id: createdJob.job_id, controller };
      const humanizerResult = await waitForJob<HumanizerResponse>({
        pollUrl: `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs/${createdJob.job_id}`,
        headers,
        signal: controller.signal,
        fetcher: fetchWithAuthRetry,
        parse: (resPayload) => {
          const job = unwrapData<HumanizerJobResponse>(resPayload);
          return {
            ...job,
            result: job.result ?? undefined,
            error: job.error ?? undefined,
          };
        },
      });
      jobRef.current = null;
      setResult(humanizerResult);
      toast.success("Humanized successfully!");
      scoreBothSides(submittedText, humanizerResult.rewritten_text);
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
      } else if (isBillingGateError(err)) {
        // Global interceptor opens upgrade popup
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
      jobRef.current = null;
    }
  };

  const handleHumanize = () => {
    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(runHumanize);
  };

  const openScorePanel = (focus: DetectionFocus) => {
    setDetectionFocus(focus);
    setAiDetectView("score");
    setActivePanel("ai_detection");
  };

  const focusedDetection =
    detectionFocus === "original" ? originalDetection : resultDetection;
  const detection = focusedDetection?.success ? focusedDetection.result : null;
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

  const originalScore =
    originalDetection?.success ? detectorPrimaryScore(originalDetection.result) : null;
  const resultScore =
    resultDetection?.success ? detectorPrimaryScore(resultDetection.result) : null;

  return (
    <div
      className={
        embedded
          ? "relative w-full"
          : "container relative mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8 2xl:max-w-6xl"
      }
    >
      <ToolsApiLoader show={loading && !streamingText} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {embedded && (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#F56200] dark:bg-orange-950/40 dark:text-orange-400">
                <FiEdit3 className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                Humanizer
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              About 30 seconds per rewrite
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch md:grid-cols-2 md:divide-x divide-y md:divide-y-0 divide-gray-200 dark:divide-gray-700">
        {/* Input */}
        <div className="min-w-0 flex flex-col transition-colors duration-300">
          <TextSummarizerInput
            title="Original text"
            onTextChange={(t) => setText(t)}
            onFileUpload={handleUploadDocument}
            initialText={text}
            placeholder="Paste your text here..."
            maxWords={maxWords}
            accept=".pdf,.docx,.txt"
            layout="inline"
            onClear={handleClear}
            headerRight={
              <ScoreBadge
                state={originalDetection}
                loading={scoringOriginal}
                onClick={originalDetection ? () => openScorePanel("original") : undefined}
              />
            }
          />

          <div className="space-y-4 px-4 pb-4 transition-colors duration-300">
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

            {/* Both labels toggle the same combined panel below — collapsed by
                default so the card reads short until the user asks for more. */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
              <button
                type="button"
                onClick={() => setShowMoreOptions((v) => !v)}
                className="font-medium text-primary-400 hover:text-primary-500 dark:text-primary-300"
                aria-expanded={showMoreOptions}
              >
                {showMoreOptions ? "− Hide" : "+ Add"} your writing sample{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  (optional)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowMoreOptions((v) => !v)}
                className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                aria-expanded={showMoreOptions}
              >
                More options
                <FiChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${showMoreOptions ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showMoreOptions && (
              <>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                    Paste something you wrote yourself. The rewrite will match
                    your style. 1–2 paragraphs works best.
                  </span>
                  <textarea
                    value={voiceSample}
                    onChange={(event) => setVoiceSample(event.target.value)}
                    maxLength={12000}
                    rows={3}
                    placeholder="Your writing sample"
                    className="mt-2 block w-full resize-y rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-normal text-gray-800 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>

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
              </>
            )}

            {wordCount > maxWords && (
              <div className="text-xs font-semibold text-[#fb2c36] dark:text-red-400">
                Word limit exceeded: {wordCount}/{maxWords}. Please trim before
                submitting.
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleHumanize}
              disabled={!canSubmit}
              className={`w-full rounded-md py-3 text-base font-semibold text-white shadow-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff] ${
                canSubmit
                  ? "bg-primary-400 hover:bg-primary-300 active:bg-primary-500"
                  : "bg-primary-400 cursor-not-allowed opacity-60"
              }`}
            >
              {loading ? "Humanize, free…" : "Humanize, free"}
            </button>
            <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
              A writing assistant for drafting and refining your own work. AI
              detectors are not 100% accurate.
            </p>
            {loading && jobRef.current && (
              <button
                type="button"
                className="mt-3 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
                onClick={() => {
                  const job = jobRef.current;
                  if (!job) return;
                  job.controller.abort();
                  jobRef.current = null;
                  setLoading(false);
                  setStreamingText("");
                  if (job.id && job.id !== "stream") {
                    void cancelJob(
                      `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/humanizer/jobs/${job.id}`,
                      { Authorization: `Bearer ${token}` },
                      fetchWithAuthRetry,
                    ).catch(() => undefined);
                  }
                }}
              >
                Cancel humanizing
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="min-w-0 flex flex-col justify-between transition-colors duration-300">
          <div className="p-4 pb-0 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {activePanel === "ai_detection" ? "AI Detection" : "Humanized"}
            </h2>
            {activePanel === "humanized" && (
              <ScoreBadge
                state={resultDetection}
                loading={scoringResult}
                onClick={resultDetection ? () => openScorePanel("result") : undefined}
              />
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-[12rem] p-4">
            {activePanel === "humanized" ? (
              /* Humanized text — dashed while empty, solid green once there's a result. */
              <div
                className={`flex-1 min-h-[16rem] rounded-lg border-2 p-4 overflow-y-auto transition-colors duration-300 ${
                  rewrittenText || streamingText
                    ? "border-emerald-400 bg-white dark:border-emerald-700 dark:bg-gray-800"
                    : "border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                }`}
              >
                {loading ? (
                  streamingText ? (
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-sm text-gray-800 dark:text-gray-100">
                      {streamingText}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-[#2b7fff] animate-pulse align-middle" />
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      In process...
                    </p>
                  )
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
                    <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600 break-words dark:bg-gray-900 dark:text-gray-300">
                      <strong>What changed:</strong> {result?.quality_issues?.length ? result.quality_issues.join("; ") : `Adjusted sentence structure and word choice using ${result?.rewrite_intensity} intensity while ${result?.citations_preserved ? "preserving" : "reviewing"} citations.`}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-sm text-gray-400 justify-center dark:text-gray-500">
                      Your humanized text and its AI score will appear here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* AI Detection */
              <div className="flex-1 flex flex-col">
                {/* Original / Humanized toggle, when both sides have a score */}
                {(originalDetection || resultDetection) && (
                  <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
                    {(
                      [
                        { key: "original" as const, label: "Original", available: !!originalDetection },
                        { key: "result" as const, label: "Humanized", available: !!resultDetection },
                      ]
                    ).map(({ key, label, available }) => (
                      <button
                        key={key}
                        type="button"
                        disabled={!available}
                        onClick={() => setDetectionFocus(key)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm border transition-colors duration-300 ${
                          detectionFocus === key
                            ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff]"
                            : available
                              ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              : "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Score / Highlights toggle */}
                {detection && (
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
                      {focusedDetection && !focusedDetection.success && (
                        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                          {focusedDetection.reason}
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

                <div className="border-t border-gray-200 p-3 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setActivePanel("humanized")}
                    className="text-sm font-medium text-primary-400 hover:text-primary-500 dark:text-primary-300"
                  >
                    ← Back to humanized text
                  </button>
                </div>
              </div>
            )}
          </div>

          {activePanel === "humanized" && rewrittenText && !loading && (
            <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md bg-primary-400 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]"
              >
                Copy text
              </button>
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                <FiDownload className="h-4 w-4" />
                {downloading ? "Preparing…" : "Download .docx"}
              </button>
              <button
                type="button"
                onClick={handleHumanize}
                disabled={loading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Rewrite again
              </button>
            </div>
          )}

          {result?.citations_preserved && result.citation_count > 0 && (
            <div className="px-4 pb-4 text-xs text-emerald-600 dark:text-emerald-400">
              Citations preserved ({result.citation_count})
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Post-humanize upsell: encourages saving a voice sample to a free
          account. Shows the before/after score transition when both sides
          were successfully scored; otherwise the CTA still renders without
          the score line (short inputs fall under the detector's minimum). */}
      {rewrittenText && !loading && (
        <div className="mt-6 flex flex-col items-start gap-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {originalScore !== null && resultScore !== null && (
              <>
                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    AI Score
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-bold">
                    <span className="text-red-500">{originalScore}%</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="text-emerald-500">{resultScore}%</span>
                  </div>
                </div>
                <div className="hidden h-12 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-700 sm:block" />
              </>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Make it sound even more like you
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Save your voice sample to a free account. Every rewrite after
                that matches how you actually write.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openGate}
            className="w-full flex-shrink-0 rounded-md bg-[#F56200] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ff7a24] sm:w-auto"
          >
            Save my voice, free
          </button>
        </div>
      )}

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default HumanizerTool;
