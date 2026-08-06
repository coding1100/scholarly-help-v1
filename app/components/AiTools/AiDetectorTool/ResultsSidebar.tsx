"use client";

import React from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiDownload,
  FiList,
  FiX,
} from "react-icons/fi";
import AiGauge from "@/app/components/AiTools/shared/AiGauge";
import {
  detectorHumanContentShare,
  detectorPrimaryScore,
  type DetectionResponse,
  type EditableSegment,
} from "./types";

export type SidebarView = "score" | "log" | "focus";

/** Word-share composition, separate from document-level authorship likelihood. */
const BREAKDOWN_ROWS = [
  { key: "ai" as const, label: "AI-like words", dot: "bg-red-500" },
  {
    key: "mixed" as const,
    label: "Mixed or uncertain words",
    dot: "bg-amber-500",
  },
  { key: "human" as const, label: "Human-like words", dot: "bg-emerald-500" },
];

/**
 * Right-hand column of the results view. Three exclusive panels, mirroring the
 * approved prototype: overall score (gauge + breakdown), the
 * activity log, and the focused-sentence panel with rewrite/ignore actions.
 */
export default function ResultsSidebar({
  result,
  view,
  onViewChange,
  log,
  focusedSegment,
  rewriteValue,
  onRewriteChange,
  onCopySentence,
  copiedSentence,
  onReplace,
  onIgnore,
  onDownloadReport,
  downloadingReport,
}: {
  result: DetectionResponse;
  view: SidebarView;
  onViewChange: (v: SidebarView) => void;
  log: string[];
  focusedSegment: EditableSegment | null;
  rewriteValue: string;
  onRewriteChange: (v: string) => void;
  onCopySentence: () => void;
  copiedSentence: boolean;
  onReplace: () => void;
  onIgnore: () => void;
  onDownloadReport: () => void;
  downloadingReport: boolean;
}) {
  const ai = detectorPrimaryScore(result);
  const human = detectorHumanContentShare(result);
  const summary =
    ai < 35
      ? "This text reads as humanized"
      : ai < 65
        ? "This text contains mixed writing patterns"
        : "This text contains predominantly AI-like writing patterns";

  const card =
    "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300";
  const backBtn =
    "flex items-center gap-1.5 text-xs text-[#2b7fff] dark:text-[#51a2ff] hover:underline mb-3";
  const smallBtn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  if (view === "log") {
    return (
      <div className={card}>
        <button
          type="button"
          className={backBtn}
          onClick={() => onViewChange("score")}
        >
          <FiArrowLeft className="h-3.5 w-3.5" /> Back to overall score
        </button>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Activity log
        </h3>
        {log.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No activity yet. Replacing, ignoring, or copying flagged text will
            appear here.
          </p>
        ) : (
          <div>
            {log.map((entry, i) => (
              <div
                key={i}
                className="py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "focus" && focusedSegment) {
    return (
      <div className={card}>
        <button
          type="button"
          className={backBtn}
          onClick={() => onViewChange("score")}
        >
          <FiArrowLeft className="h-3.5 w-3.5" /> Back to overall score
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Selected sentence
        </div>
        <div className="rounded-md bg-gray-50 dark:bg-gray-900/60 p-3 text-sm text-gray-800 dark:text-gray-100 mb-2">
          {focusedSegment.text}
        </div>
        <button type="button" className={smallBtn} onClick={onCopySentence}>
          {copiedSentence ? (
            <>
              <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <FiCopy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
        <div className="my-3 text-sm text-gray-600 dark:text-gray-300 leading-6">
          {focusedSegment.reasons.join(" ")}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Rewrite it yourself
        </div>
        <textarea
          rows={3}
          value={rewriteValue}
          onChange={(e) => onRewriteChange(e.target.value)}
          placeholder="Type your own version…"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] mb-3 resize-y"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReplace}
            disabled={!rewriteValue.trim()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-400 hover:bg-primary-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onIgnore}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <FiX className="h-3.5 w-3.5" /> Ignore
          </button>
        </div>
      </div>
    );
  }

  // Default: overall score.
  return (
    <div className="space-y-3">
      <div className={`${card} text-center`}>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {ai}% AI-like content detected
        </div>
        <div className="flex justify-center">
          <AiGauge percent={ai} colorByScore />
        </div>
        <div className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
          {summary}
        </div>
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {human}% human-like content
        </div>
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500" title="Detector model and engine versions">
          Model {result.meta.model_version} · Engine {result.meta.engine_version} · {result.meta.latency_ms} ms
        </div>
        <div className="mt-4 text-left">
          <div className="pb-1.5 text-xs text-gray-400 dark:text-gray-500">
            Estimated composition across {result.meta.words} analyzed words
          </div>
          {BREAKDOWN_ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between py-1.5 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${row.dot}`}
                />
                {row.label}
              </span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {result.breakdown[row.key]}%
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onDownloadReport}
          disabled={downloadingReport}
          className={`${smallBtn} w-full justify-center mt-4`}
        >
          <FiDownload className="h-3.5 w-3.5" />
          {downloadingReport ? "Preparing report…" : "Download report"}
        </button>
        <button
          type="button"
          onClick={() => onViewChange("log")}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#2b7fff] dark:text-[#51a2ff] hover:underline"
        >
          <FiList className="h-3.5 w-3.5" /> View activity log
        </button>
      </div>
    </div>
  );
}
