"use client";

import React from "react";

/**
 * Small circular score dial (0–100, no percent sign) for the category row and
 * the report modal. AiGauge isn't reused here: it renders a "%" suffix and is
 * sized for the detector's hero score, while these dials are compact and
 * color-coded per category.
 */
export default function ScoreDial({
  score,
  color,
  size = 58,
  label,
}: {
  score: number;
  color: string;
  size?: number;
  label?: string;
}) {
  const stroke = size >= 70 ? 7 : 5;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const dash = (clamped / 100) * c;

  return (
    <div className="flex flex-col items-center">
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
            stroke={color}
            fill="none"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold ${size >= 70 ? "text-lg" : "text-sm"} ${
              clamped === 100
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {clamped}
          </span>
        </div>
      </div>
      {label && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      )}
    </div>
  );
}
