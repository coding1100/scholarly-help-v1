"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import ActionButtons from "@/app/components/AiTools/ActionButtons";
import TextSummarizerInput from "@/app/components/AiTools/TextSummarizerInput";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import CopyPanel from "./CopyPanel";
import ResultsSidebar, { type SidebarView } from "./ResultsSidebar";
import SegmentedDoc from "./SegmentedDoc";
import {
  type DetectionResponse,
  type EditableSegment,
  type SegmentLabel,
  normalizeDetectionResponse,
} from "./types";
import { useDetectorConfig } from "./useDetectorConfig";
import { getAccessToken } from "@/app/lib/authSession";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { useToolDraftPersistence } from "@/app/lib/client/useToolDraftPersistence";
import { useBillingDraftStash } from "@/app/lib/client/useBillingDraftStash";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

type Filter = "all" | Exclude<SegmentLabel, "neutral">;

const CHIPS: { key: Filter; label: string; dot?: string }[] = [
  { key: "all", label: "All" },
  { key: "human", label: "Human", dot: "bg-emerald-500" },
  { key: "mixed", label: "Mixed", dot: "bg-amber-500" },
  { key: "ai", label: "AI", dot: "bg-red-500" },
];

function timeStamp(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** sha256 hex via Web Crypto — feedback sends a hash, never the text itself. */
async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const AiDetectorTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [segments, setSegments] = useState<EditableSegment[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sidebarView, setSidebarView] = useState<SidebarView>("score");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [rewriteValue, setRewriteValue] = useState("");
  const [copiedSentence, setCopiedSentence] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [rescanNeeded, setRescanNeeded] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  type AiDetectorDraft = { text: string };

  const { stashDraft } = useToolDraftPersistence<AiDetectorDraft>(
    "ai-detector",
    (draft) => {
      if (draft.text) setText(draft.text);
    },
  );

  useBillingDraftStash<AiDetectorDraft>("ai-detector", () => ({ text }));

  const { gateOpen, closeGate, guardAiClick } = useGuestGate<AiDetectorDraft>({
    getDraft: () => ({ text }),
    stashDraft,
  });
  const detectorConfig = useDetectorConfig();
  const feedbackQueueRef = useRef<Set<string>>(new Set());
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { minimum_words: minimumWords, maximum_words: maximumWords } =
    detectorConfig;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(getAccessToken());
    }
  }, []);

  const wordCount = useMemo(() => countWords(text), [text]);
  const canSubmit =
    text.trim().length > 0 && wordCount <= maximumWords && !loading;

  const addLog = (entry: string) =>
    setLog((prev) => [`${timeStamp()} — ${entry}`, ...prev]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const flushFeedback = async () => {
    const hashes = [...feedbackQueueRef.current]; feedbackQueueRef.current.clear();
    await Promise.allSettled(hashes.map((text_sha256) => axios.post(
      `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect/feedback`, { text_sha256 }, { headers: authHeaders },
    )));
  };

  const queueFeedback = (hash: string) => {
    feedbackQueueRef.current.add(hash);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => void flushFeedback(), 2000);
  };

  useEffect(() => () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (feedbackQueueRef.current.size) void flushFeedback();
  }, []);

  const resetResults = () => {
    setResult(null);
    setSegments([]);
    setFilter("all");
    setSidebarView("score");
    setFocusedIndex(null);
    setRescanNeeded(false);
  };

  const handleClear = () => {
    setText("");
    resetResults();
    setLog([]);
  };

  const validate = (input: string): boolean => {
    const words = countWords(input);
    if (!input.trim()) {
      toast.error("Please enter some text.");
      return false;
    }
    if (words < minimumWords) {
      toast.error(
        `Please provide at least ${minimumWords} words — detection on very short text is unreliable, and we won't show a misleading score.`,
      );
      return false;
    }
    if (words > maximumWords) {
      toast.error(`Please keep input at or under ${maximumWords} words.`);
      return false;
    }
    if (looksLikeGibberish(input)) {
      toast.error(
        "This doesn't look like readable text. Please enter meaningful content to check.",
      );
      return false;
    }
    return true;
  };

  const runDetection = async (input: string, isRescan: boolean) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect`,
        {
          text: input,
          options: {
            include_segments: true,
            include_signals: true,
            mode: "standard",
          },
        },
        { headers: authHeaders },
      );
      // Backend wraps responses as { success, message, data }
      const data = normalizeDetectionResponse((response.data?.data ?? response.data) as DetectionResponse);
      setResult(data);
      setSegments(
        (data.segments ?? []).map((s) => ({
          ...s,
          edited: false,
          ignored: false,
        })),
      );
      setFilter("all");
      setSidebarView("score");
      setFocusedIndex(null);
      setRescanNeeded(false);
      if (isRescan) addLog("Document rescanned");
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to check for AI.";
      if (status === 401) {
        toast.error("Session expired. Please sign in again.");
      } else if (status === 403) {
        toast.error(
          "You don't have enough token balance, or the input exceeds limits.",
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

  const handleDetect = () => {
    if (!validate(text)) return;
    guardAiClick(() => {
      trackToolGenerate({ toolName: "AI Detector Tool" });
      void runDetection(text, false);
    });
  };

  const currentDocText = () => segments.map((s) => s.text).join(" ");

  const handleRescan = () => {
    const rebuilt = currentDocText();
    if (!validate(rebuilt)) return;
    guardAiClick(() => {
      setText(rebuilt);
      void runDetection(rebuilt, true);
    });
  };

  const handleUploadDocument = async (file: File) => {
    setLoading(true);
    resetResults();
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
      const responseData = response.data?.data ?? response.data;
      const extracted = String(responseData || "").trim();
      setText(extracted);
      if (countWords(extracted) > maximumWords) {
        toast.error(
          `This document is over ${maximumWords} words. Please trim it before checking.`,
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

  const handleUploadImage = async (file: File) => {
    setLoading(true);
    resetResults();
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect/ocr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const responseData = response.data?.data ?? response.data;
      const extracted = String(responseData?.text ?? responseData ?? "").trim();
      if (!extracted) {
        toast.error("No readable text found in this image.");
        return;
      }
      setText(extracted);
      toast.success("Text extracted from image.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to read the image.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  /** Route uploads by type: images go through OCR, documents through the parser. */
  const handleUpload = (file: File) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      void handleUploadImage(file);
    } else {
      void handleUploadDocument(file);
    }
  };

  const focusedSegment = focusedIndex !== null ? segments[focusedIndex] : null;

  const handleSelectSegment = (index: number) => {
    setFocusedIndex(index);
    setSidebarView("focus");
    setRewriteValue("");
    setCopiedSentence(false);
  };

  const handleCopySentence = async () => {
    if (!focusedSegment) return;
    try {
      await navigator.clipboard.writeText(focusedSegment.text);
      setCopiedSentence(true);
      setTimeout(() => setCopiedSentence(false), 1500);
      addLog("Copied a flagged sentence");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const applyReplacement = (index: number, newText: string) => {
    setSegments((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, text: newText, edited: true } : s,
      ),
    );
    setRescanNeeded(true);
    setSidebarView("score");
    setFocusedIndex(null);
    addLog("Replaced a flagged sentence with your rewrite");
  };

  const handleReplace = () => {
    if (focusedIndex === null || !focusedSegment) return;
    const manual = rewriteValue.trim();
    if (!manual) return;
    applyReplacement(focusedIndex, manual);
  };

  const handleIgnore = () => {
    if (focusedIndex === null) return;
    setSegments((prev) =>
      prev.map((s, i) => (i === focusedIndex ? { ...s, ignored: true } : s)),
    );
    setSidebarView("score");
    setFocusedIndex(null);
    addLog("Ignored a flag — marked as your own writing");
    // Weak-label feedback for the drift flywheel: fire-and-forget, hash only.
    void (async () => {
      try {
        const text_sha256 = await sha256Hex(text.trim());
        queueFeedback(text_sha256);
      } catch {
        // Feedback is best-effort; never surface an error for it.
      }
    })();
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setDownloadingReport(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect/report`,
        { text: currentDocText() },
        { headers: authHeaders, responseType: "blob" },
      );
      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-detection-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
      addLog("Downloaded the detection report");
    } catch {
      toast.error("Failed to generate the report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const chipCount = (key: Filter): number =>
    key === "all"
      ? segments.length
      : segments.filter((s) => !s.edited && !s.ignored && s.label === key)
          .length;

  return (
    <div className="container relative mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={loading} />

      {!result ? (
        /* ------------------------------ Input view ------------------------ */
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 min-w-0 flex flex-col transition-colors duration-300">
          <TextSummarizerInput
            title="AI Detector"
            onTextChange={(t) => setText(t)}
            onFileUpload={handleUpload}
            initialText={text}
            placeholder="Paste your text here..."
            maxWords={maximumWords}
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
            scrollable
          />
          <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Checks whether text reads as AI-generated, human-written, or mixed
              — with sentence-level highlights and plain-language explanations.
            </p>
            <p className="rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Disclaimer: No AI detector is 100% accurate, including this one.
              Scores are calibrated estimates with a confidence range — never
              treat a score alone as proof of authorship. We do not store your
              text.
            </p>
            {wordCount > 0 && wordCount < minimumWords && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {minimumWords - wordCount} more word
                {minimumWords - wordCount === 1 ? "" : "s"} needed — short text
                can&apos;t be scored reliably.
              </div>
            )}
            {wordCount > maximumWords && (
              <div className="text-xs font-semibold text-[#fb2c36] dark:text-red-400">
                Word limit exceeded: {wordCount}/{maximumWords}. Please trim
                before submitting.
              </div>
            )}
          </div>
          <ActionButtons
            onClear={handleClear}
            onSubmit={handleDetect}
            submitButtonText="Check for AI"
            isSubmitting={loading}
            isDisabled={!canSubmit}
          />
        </div>
      ) : (
        /* ------------------------------ Results view ---------------------- */
        <div>
          {/* Chip filter row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilter(chip.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                    filter === chip.key
                      ? "border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff] bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {chip.dot && (
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${chip.dot}`}
                    />
                  )}
                  {chip.label} · {chipCount(chip.key)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-primary-300 active:bg-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff]"
            >
              <FiPlus className="h-4 w-4" />
              New scan
            </button>
          </div>

          {/* Copy panel for the selected class */}
          {filter !== "all" && (
            <CopyPanel
              filter={filter}
              segments={segments}
              onCopyAll={() => addLog(`Copied all ${filter} text`)}
            />
          )}

          {/* Rescan banner */}
          {rescanNeeded && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-md bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 text-sm text-[#1d4ed8] dark:text-[#93c5fd]">
              <span>Text edited — the score may be out of date.</span>
              <button
                type="button"
                onClick={handleRescan}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#2b7fff] px-3 py-1.5 text-xs font-medium text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff] hover:bg-white dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <FiRefreshCw className="h-3.5 w-3.5" /> Rescan
              </button>
            </div>
          )}

          {/* Document + sidebar */}
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1.4fr_1fr]">
            <SegmentedDoc
              segments={segments}
              filter={filter}
              focusedIndex={focusedIndex}
              onSelect={handleSelectSegment}
            />
            <ResultsSidebar
              result={result}
              view={sidebarView}
              onViewChange={(v) => {
                setSidebarView(v);
                if (v !== "focus") setFocusedIndex(null);
              }}
              log={log}
              focusedSegment={focusedSegment}
              rewriteValue={rewriteValue}
              onRewriteChange={setRewriteValue}
              onCopySentence={handleCopySentence}
              copiedSentence={copiedSentence}
              onReplace={handleReplace}
              onIgnore={handleIgnore}
              onDownloadReport={handleDownloadReport}
              downloadingReport={downloadingReport}
            />
          </div>
        </div>
      )}

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default AiDetectorTool;
