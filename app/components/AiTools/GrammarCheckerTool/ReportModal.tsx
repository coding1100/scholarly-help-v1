"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import ScoreDial from "./ScoreDial";
import { buildReportStats, type CategoryScores } from "./types";

/**
 * Performance report: overall dial, word-count block, readability (Flesch-
 * Kincaid grade), category breakdown. Everything is computed client-side from
 * the CURRENT document, so accepted fixes are reflected immediately.
 */

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
  scores: CategoryScores;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, text, scores }) => {
  if (!open) return null;
  const stats = buildReportStats(text);

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div className="text-sm text-gray-600 dark:text-gray-300">
      {label}{" "}
      <span className="font-bold text-primary-400 dark:text-[#8b8ff0]">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 print:static print:bg-transparent print:p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 print:max-h-none print:shadow-none">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Performance report
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 print:hidden"
          >
            <FiX />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <ScoreDial score={scores.overall} color="#565add" size={76} />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Overall writing score
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Average of Grammar, Tense, Clarity and Tone.
            </p>
          </div>
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Word count
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
          <Row label="Words" value={stats.wordCount.toLocaleString()} />
          <Row label="Reading time" value={`${stats.readTimeMin} min`} />
          <Row label="Sentences" value={stats.sentenceCount} />
          <Row label="Characters" value={stats.charCount.toLocaleString()} />
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Readability
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
          <Row
            label="Avg. sentence length"
            value={`${stats.avgSentenceLength} words`}
          />
          <Row label="Readability grade" value={`Grade ${stats.fkGrade}`} />
        </div>
        <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
          This text is likely understandable by a reader at roughly a grade{" "}
          {stats.fkGrade} reading level.
        </p>

        <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Category breakdown
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
          <Row label="Grammar" value={`${scores.grammar}/100`} />
          <Row label="Clarity" value={`${scores.clarity}/100`} />
          <Row label="Tense" value={`${scores.tense}/100`} />
          <Row label="Tone" value={`${scores.tone}/100`} />
        </div>

        <button
          onClick={() => window.print()}
          className="mt-5 w-full rounded-lg bg-primary-400 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-300 print:hidden"
        >
          Download as PDF
        </button>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 print:hidden">
          Opens your browser&apos;s print dialog — choose &quot;Save as PDF&quot; as
          the destination.
        </p>
      </div>
    </div>
  );
};

export default ReportModal;
