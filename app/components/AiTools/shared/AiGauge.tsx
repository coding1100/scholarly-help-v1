"use client";

import React from "react";

/**
 * Circular AI-likelihood gauge shared by the AI Detector and the Humanizer's
 * "Check AI" panel (extracted from HumanizerTool so both render identically).
 *
 * With `colorByScore` the ring color follows severity (green → amber → red as the
 * AI percent rises); without it the ring stays emerald (the Humanizer's original
 * look).
 */
export default function AiGauge({
  percent,
  colorByScore = false,
  size = 180,
}: {
  percent: number;
  colorByScore?: boolean;
  size?: number;
}) {
  const stroke = size >= 160 ? 14 : 10;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const dash = (clamped / 100) * c;
  const gap = c - dash;

  const ringClass = !colorByScore
    ? "text-emerald-500"
    : clamped >= 50
      ? "text-red-500"
      : clamped >= 25
        ? "text-amber-500"
        : "text-emerald-500";

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
          className={ringClass}
          stroke="currentColor"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`font-semibold text-gray-800 dark:text-gray-100 ${
            size >= 160 ? "text-4xl" : "text-2xl"
          }`}
        >
          {clamped}%
        </div>
      </div>
    </div>
  );
}
