"use client";

import React from "react";
import { GradeScale } from "../types";
import { Button, Card, CardBody, CardHeader, Input, Label } from "./ui";

export default function GradeScaleEditor(props: {
  gradeScale: GradeScale;
  onChange: (next: GradeScale) => void;
  onBack?: () => void;
}) {
  const { gradeScale, onChange, onBack } = props;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:hover:bg-slate-900/40"
                  aria-label="Back"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Grade scale</div>
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Edit grade points to match your institution. Letters are code-configurable for future A+ / 4.33 support.
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              // Re-apply same letters ordering, but normalize invalid values to 0
              const nextPoints: Record<string, number> = {};
              for (const l of gradeScale.letters) {
                const v = gradeScale.pointsByLetter[l];
                nextPoints[l] = typeof v === "number" && Number.isFinite(v) ? v : 0;
              }
              onChange({ ...gradeScale, pointsByLetter: nextPoints });
            }}
          >
            Normalize
          </Button>
        </div>
      </CardHeader>
      <CardBody className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {gradeScale.letters.map((letter) => (
          <div key={letter} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
            <Label className="flex items-center justify-between">
              <span>{letter}</span>
              <span className="text-xs text-slate-400">pts</span>
            </Label>
            <Input
              className="mt-2"
              inputMode="decimal"
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={String(gradeScale.pointsByLetter[letter] ?? "")}
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = Number(raw);
                onChange({
                  ...gradeScale,
                  pointsByLetter: {
                    ...gradeScale.pointsByLetter,
                    [letter]: Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0,
                  },
                });
              }}
              aria-label={`${letter} grade points`}
            />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

