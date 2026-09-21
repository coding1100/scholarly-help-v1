"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiLoader, FiSearch, FiZap } from "react-icons/fi";
import AiGauge from "../shared/AiGauge";
import { detectorPrimaryScore, normalizeDetectionResponse, type DetectionResponse } from "../AiDetectorTool/types";
import { useDetectorConfig } from "../AiDetectorTool/useDetectorConfig";
import { fetchWithAuthRetry } from "@/app/lib/authSession";
import { waitForJob, type JobStatus } from "@/app/lib/client/jobStream";
import { isBillingGateError } from "@/app/lib/client/billingGateCodes";
import { countWords, looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

type Action = "detect" | "humanize";
type HumanizerResult = { rewritten_text: string };
type Result = { source: string } & (
  | { action: "detect"; detection: DetectionResponse }
  | { action: "humanize"; text: string }
);

function unwrap<T>(payload: unknown): T {
  return (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T;
}

export default function DraftTools({ draft, disabled, api, requestHeaders, guardAiClick, onApply }: {
  draft: string;
  disabled: boolean;
  api: string;
  requestHeaders: () => Promise<Record<string, string>>;
  guardAiClick: (run: () => void | Promise<void>) => boolean;
  onApply: (text: string) => void;
}) {
  const config = useDetectorConfig();
  const [busy, setBusy] = useState<Action | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  function run(action: Action) {
    if (disabled || controllerRef.current || !draft.trim()) return;
    const words = countWords(draft);
    const maximum = action === "detect" ? config.maximum_words : 1500;
    if (action === "detect" && words < config.minimum_words) {
      toast.error(`Please provide at least ${config.minimum_words} words for AI detection.`);
      return;
    }
    if (words > maximum) {
      toast.error(`Please keep the draft at or under ${maximum} words for ${action === "detect" ? "AI detection" : "humanizing"}.`);
      return;
    }
    if (looksLikeGibberish(draft)) {
      toast.error("Please enter meaningful text in the draft first.");
      return;
    }
    guardAiClick(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setBusy(action);
      setProgress(0);
      setResult(null);
      setError("");
      trackToolGenerate({ toolName: action === "detect" ? "AI Detector Tool" : "Humanizer Tool" });
      try {
        const headers = await requestHeaders();
        if (controller.signal.aborted) return;
        if (action === "detect") {
          const response = await axios.post(`${api}/tools/ai-detect`, {
            text: draft,
            options: { include_segments: true, include_signals: true, mode: "standard" },
          }, { headers, signal: controller.signal });
          setResult({ action, source: draft, detection: normalizeDetectionResponse(unwrap<DetectionResponse>(response.data)) });
        } else {
          const response = await axios.post(`${api}/tools/humanizer/jobs`, {
            text: draft, tone_mode: "natural", rewrite_intensity: "moderate",
            preserve_citations: true, return_diff: true,
          }, { headers, signal: controller.signal });
          const job = unwrap<{ job_id: string }>(response.data);
          if (!job.job_id) throw new Error("Humanizer did not return a job id.");
          const humanized = await waitForJob<HumanizerResult>({
            pollUrl: `${api}/tools/humanizer/jobs/${job.job_id}`,
            headers, signal: controller.signal, fetcher: fetchWithAuthRetry,
            parse: (payload) => unwrap<JobStatus<HumanizerResult>>(payload),
            onProgress: (state) => setProgress(state.progress ?? 0),
          });
          if (!humanized.rewritten_text?.trim()) throw new Error("Humanizer returned an empty draft. Please try again.");
          setResult({ action, source: draft, text: humanized.rewritten_text });
        }
      } catch (cause) {
        if (controller.signal.aborted || isBillingGateError(cause)) return;
        const message = axios.isAxiosError(cause)
          ? cause.response?.data?.message || cause.response?.data?.error || cause.message
          : cause instanceof Error ? cause.message : "Something went wrong. Please try again.";
        setError(Array.isArray(message) ? message.join(", ") : String(message));
      } finally {
        if (!controller.signal.aborted) {
          controllerRef.current = null;
          setBusy(null);
        }
      }
    });
  }

  const stale = result !== null && result.source !== draft;
  const buttonsDisabled = disabled || Boolean(busy) || !draft.trim();
  const activeAction = busy ?? (!stale ? result?.action : null);
  const buttonClassName = (action: Action) =>
    `flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors enabled:hover:border-[#534ab7] enabled:hover:bg-[#eeedfe] enabled:hover:text-[#3c3489] disabled:opacity-50 ${
      activeAction === action ? "border-[#534ab7] bg-[#eeedfe] text-[#3c3489]" : "border-gray-200 bg-white"
    }`;
  return <div className="space-y-3">
    <button type="button" disabled={buttonsDisabled} onClick={() => run("detect")} className={buttonClassName("detect")}>
      {busy === "detect" ? <FiLoader className="animate-spin" /> : <FiSearch />} Check with AI Detector
    </button>
    <button type="button" disabled={buttonsDisabled} onClick={() => run("humanize")} className={buttonClassName("humanize")}>
      {busy === "humanize" ? <FiLoader className="animate-spin" /> : <FiZap />} Humanize with Humanizer
    </button>
    <div aria-live="polite" className="space-y-3 text-sm">
      {busy && <p className="text-gray-600">{busy === "detect" ? "Checking your essay..." : `Humanizing your essay${progress ? ` (${Math.round(progress)}%)` : ""}...`}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {stale && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">The draft has changed. Run the tool again for the current essay.</p>}
      {result?.action === "detect" && !stale && <div className="space-y-2 rounded-lg bg-gray-50 p-3">
        <p className="font-semibold">AI content score</p>
        <div className="flex justify-center"><AiGauge percent={detectorPrimaryScore(result.detection)} colorByScore size={140} /></div>
        {result.detection.meta.warning && <p className="text-xs text-amber-800">{result.detection.meta.warning}</p>}
        {!result.detection.trust.trustworthy && <p className="text-xs text-gray-600">{result.detection.trust.reason}</p>}
      </div>}
      {result?.action === "humanize" && !stale && <div className="space-y-3">
        <p className="font-semibold">Humanized essay</p>
        <p className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-700">{result.text}</p>
        <button type="button" disabled={disabled} onClick={() => {
          onApply(result.text);
          setResult(null);
          toast.success("Humanized essay applied. You can undo this change.");
        }} className="w-full rounded-lg bg-[#534ab7] px-3 py-2 font-semibold text-white disabled:opacity-50">Apply to draft</button>
      </div>}
    </div>
  </div>;
}
