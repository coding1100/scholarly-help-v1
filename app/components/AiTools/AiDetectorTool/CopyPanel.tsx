"use client";

import React, { useState } from "react";
import { FiCheck, FiChevronDown, FiCopy } from "react-icons/fi";
import type { EditableSegment, SegmentLabel } from "./types";

/**
 * Shown when a class chip (Human / Mixed / AI) is active: lists that class's
 * sentences with an expandable "why" per sentence, plus a copy-all action.
 */
export default function CopyPanel({
  filter,
  segments,
  onCopyAll,
}: {
  filter: Exclude<SegmentLabel, "neutral">;
  segments: EditableSegment[];
  onCopyAll: (text: string) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const list = segments.filter(
    (s) => !s.edited && !s.ignored && s.label === filter,
  );
  const label = filter.charAt(0).toUpperCase() + filter.slice(1);

  const handleCopyAll = async () => {
    const text = list.map((s) => s.text).join(" ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onCopyAll(text);
    } catch {
      // clipboard denied — nothing actionable
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-3 overflow-hidden transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {label} text · {list.length} sentence{list.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={handleCopyAll}
          disabled={list.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[#2b7fff] text-[#2b7fff] dark:border-[#51a2ff] dark:text-[#51a2ff] hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {copied ? (
            <>
              <FiCheck className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <FiCopy className="h-3.5 w-3.5" /> Copy {filter} text
            </>
          )}
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto px-4">
        {list.length === 0 ? (
          <p className="py-3 text-sm text-gray-400 dark:text-gray-500">
            No {filter} sentences in this scan.
          </p>
        ) : (
          list.map((seg, i) => {
            const preview =
              seg.text.length > 70 ? `${seg.text.slice(0, 70)}…` : seg.text;
            const open = openIndex === i;
            return (
              <div
                key={i}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center gap-2 py-2.5 text-left"
                >
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                    {open ? seg.text : preview}
                  </span>
                  <FiChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <div className="pb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Why is it {filter}?
                    </span>{" "}
                    {seg.reasons.join(" ")}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
