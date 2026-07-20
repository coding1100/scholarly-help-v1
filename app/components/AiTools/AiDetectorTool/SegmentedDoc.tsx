"use client";

import React from "react";
import type { EditableSegment, SegmentLabel } from "./types";

const SEGMENT_BG: Record<SegmentLabel, string> = {
  human: "bg-emerald-100 dark:bg-emerald-900/40",
  mixed: "bg-amber-100 dark:bg-amber-900/40",
  ai: "bg-red-100 dark:bg-red-900/40",
  neutral: "bg-gray-100 dark:bg-gray-700/50",
};

/**
 * The scanned document rendered as clickable sentence segments, tinted by class.
 * Filtering dims the classes that are not selected; edited/ignored segments show
 * neutral until the user rescans.
 */
export default function SegmentedDoc({
  segments,
  filter,
  focusedIndex,
  onSelect,
}: {
  segments: EditableSegment[];
  filter: "all" | SegmentLabel;
  focusedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 sm:p-7 max-h-[480px] overflow-y-auto transition-colors duration-300">
      <p className="font-serif text-[15px] leading-8 text-gray-800 dark:text-gray-100">
        {segments.map((seg, i) => {
          const settled = seg.edited || seg.ignored;
          const dimmedByFilter =
            filter !== "all" && !settled && seg.label !== filter;
          const dimmedByFocus = focusedIndex !== null && focusedIndex !== i;
          return (
            <React.Fragment key={i}>
              <span
                role="button"
                tabIndex={0}
                onClick={() => onSelect(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(i);
                  }
                }}
                title={
                  settled
                    ? "Edited — rescan to rescore"
                    : `${seg.label} · ${Math.round(seg.prob_ai * 100)}% AI likelihood`
                }
                className={`cursor-pointer rounded-sm px-0.5 transition-opacity duration-150 ${
                  settled ? SEGMENT_BG.neutral : SEGMENT_BG[seg.label]
                } ${dimmedByFilter || dimmedByFocus ? "opacity-40" : "opacity-100"} ${
                  focusedIndex === i
                    ? "ring-2 ring-[#2b7fff] ring-opacity-60"
                    : ""
                }`}
              >
                {seg.text}
              </span>{" "}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}
