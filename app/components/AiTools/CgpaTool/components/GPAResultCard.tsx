"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { CalculatorState } from "../types";
import { computeCumulativeTotals } from "../utils/calc";
import { formatGpaMaybe, roundTo } from "../utils/numbers";
import { createId } from "../utils/id";
import { Button, Card, CardBody, CardHeader, Input, Label, Stat } from "./ui";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

export default function GPAResultCard(props: {
  state: CalculatorState;
  onChange: (next: CalculatorState) => void;
  onReset: () => void;
}) {
  const { state, onChange, onReset } = props;

  const totals = useMemo(() => computeCumulativeTotals(state), [state]);
  const prevDisplayRef = useRef<string | null>(null);

  useEffect(() => {
    const nextDisplay = formatGpaMaybe(totals.cgpa);
    const prevDisplay = prevDisplayRef.current;
    prevDisplayRef.current = nextDisplay;

    // Fire only when display changes from "0.00" to any other numeric value.
    if (prevDisplay === null) return;
    if (prevDisplay !== "0.00") return;
    if (nextDisplay === "0.00" || nextDisplay === "—") return;

    trackToolGenerate({ toolName: "CGPA Calculator" });
  }, [totals.cgpa]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Cumulative summary
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Quality points = grade points × credits. GPA = total quality
              points ÷ total credits.
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 md:max-w-[55%]">
            Use these options to compute CGPA exactly how you want.
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...state,
                  preferences: {
                    ...state.preferences,
                    includePreviousInCgpa: true,
                    currentSemesterOnly: false,
                  },
                })
              }
              aria-pressed={state.preferences.includePreviousInCgpa}
              className={[
                "h-10 rounded-xl px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                state.preferences.includePreviousInCgpa
                  ? "bg-[#565add] text-white"
                  : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40",
              ].join(" ")}
              title="Include previous CGPA"
            >
              Include previous CGPA
            </button>

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...state,
                  preferences: {
                    ...state.preferences,
                    currentSemesterOnly: true,
                    includePreviousInCgpa: false,
                  },
                })
              }
              aria-pressed={state.preferences.currentSemesterOnly}
              className={[
                "h-10 rounded-xl px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                state.preferences.currentSemesterOnly
                  ? "bg-[#565add] text-white"
                  : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40",
              ].join(" ")}
              title="Current semester only"
            >
              Current semester only
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Previous semesters (optional)
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Enter total credits and GPA per previous semester (or term).
                Rows with invalid data are ignored.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = [
                  ...(state.previousSemesters || []),
                  { id: createId("prev"), credits: "", gpa: "" },
                ];
                onChange({ ...state, previousSemesters: next });
              }}
              className="inline-flex h-10 w-10 items-center justify-center bg-[#565add] text-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 shrink-0"
              aria-label="Add previous semester GPA"
              title="Add"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
              <div className="col-span-5">Total credits</div>
              <div className="col-span-6">GPA</div>
            </div>

            {(state.previousSemesters || []).map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-2 md:items-start items-center"
              >
                <div className="col-span-5">
                  <Label className="sm:hidden">Total credits</Label>
                  <Input
                    inputMode="decimal"
                    value={row.credits}
                    onChange={(e) => {
                      const next = (state.previousSemesters || []).map((r) =>
                        r.id === row.id ? { ...r, credits: e.target.value } : r,
                      );
                      onChange({ ...state, previousSemesters: next });
                    }}
                    placeholder="e.g. 15"
                    aria-label="Total credits"
                  />
                </div>

                <div className="col-span-5">
                  <Label className="sm:hidden">GPA</Label>
                  <Input
                    inputMode="decimal"
                    value={row.gpa}
                    onChange={(e) => {
                      const next = (state.previousSemesters || []).map((r) =>
                        r.id === row.id ? { ...r, gpa: e.target.value } : r,
                      );
                      onChange({ ...state, previousSemesters: next });
                    }}
                    placeholder="e.g. 3.25"
                    aria-label="GPA"
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const next = (state.previousSemesters || []).filter(
                        (r) => r.id !== row.id,
                      );
                      onChange({
                        ...state,
                        previousSemesters: next.length
                          ? next
                          : [{ id: createId("prev"), credits: "", gpa: "" }],
                      });
                    }}
                    className="w-full sm:w-10 sm:px-0 lg:w-auto lg:px-3"
                    aria-label="Remove previous semester row"
                  >
                    <span className="hidden lg:inline">Remove</span>
                    <svg
                      className="block lg:hidden"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat
              label="Total credits added"
              value={roundTo(totals.previousCredits, 2).toFixed(2)}
            />
            <Stat
              label="Previous CGPA"
              value={formatGpaMaybe(totals.previousGpa)}
            />
          </div>
        </div>

        {state.preferences.includePreviousInCgpa ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat
              label="Current credits"
              value={roundTo(totals.currentCredits, 2).toFixed(2)}
            />
            <Stat
              label="Current quality points"
              value={roundTo(totals.currentQualityPoints, 4).toFixed(4)}
            />
            <Stat
              label="Final total credits"
              value={roundTo(totals.finalCredits, 2).toFixed(2)}
              subValue={
                totals.includePrevious
                  ? "Includes previous credits"
                  : "Previous excluded"
              }
            />
            <Stat
              label="Final quality points"
              value={roundTo(totals.finalQualityPoints, 4).toFixed(4)}
              subValue={
                totals.includePrevious
                  ? "Includes previous quality points"
                  : "Previous excluded"
              }
            />
          </div>
        ) : null}

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-950/30">
          <div className="text-xs font-medium text-violet-700 dark:text-violet-200">
            Final CGPA
          </div>
          <div className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {formatGpaMaybe(totals.cgpa)}
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Rounded to 2 decimals for display.
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
