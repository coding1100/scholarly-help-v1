"use client";

import React, { useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import DoneForYouCard from "../DoneForYouCard";
import { CalculatorState, Course } from "./types";
import { createEmptyCourse, createInitialState } from "./utils/state";
import { computeSemesterTotals, computeCumulativeTotals } from "./utils/calc";
import { formatGpaMaybe, parseNumberLoose, clampMin } from "./utils/numbers";
import { getGradePoints } from "./utils/gradeScale";

/** Grades needed next term to reach the given GPA target, given current cumulative standing. */
function gradesNeededForTarget(
  target: number,
  finalCredits: number,
  finalQualityPoints: number,
  nextTermCredits: number,
) {
  if (nextTermCredits <= 0) return null;
  const requiredQualityPoints =
    target * (finalCredits + nextTermCredits) - finalQualityPoints;
  const requiredGpa = requiredQualityPoints / nextTermCredits;
  return requiredGpa;
}

function isFilled(course: Course) {
  return Boolean(
    course.name.trim() || course.gradeLetter || course.credits.trim(),
  );
}

/** Keeps exactly one empty row at the end, so there is always a row to type into. */
function withTrailingEmptyRow(courses: Course[]) {
  const last = courses[courses.length - 1];
  return !last || isFilled(last) ? [...courses, createEmptyCourse()] : courses;
}

export default function CollegeGpaCalculator() {
  const initial = useMemo(() => createInitialState(), []);
  const [state, setState] = useState<CalculatorState>(initial);

  const semester = state.semesters[0];
  const gradeScale = state.gradeScale;

  const semesterTotals = useMemo(
    () => computeSemesterTotals(semester, gradeScale),
    [semester, gradeScale],
  );

  const cumulativeTotals = useMemo(
    () => computeCumulativeTotals(state),
    [state],
  );

  const previousRow = state.previousSemesters[0];

  function updateCourse(id: string, patch: Partial<Course>) {
    setState((prev) => {
      const courses = prev.semesters[0].courses.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      );
      return {
        ...prev,
        semesters: [
          { ...prev.semesters[0], courses: withTrailingEmptyRow(courses) },
        ],
      };
    });
  }

  function removeCourse(id: string) {
    setState((prev) => {
      const courses = prev.semesters[0].courses.filter((c) => c.id !== id);
      return {
        ...prev,
        semesters: [
          { ...prev.semesters[0], courses: withTrailingEmptyRow(courses) },
        ],
      };
    });
  }

  function toggleIncludePrevious(next: boolean) {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, includePreviousInCgpa: next },
    }));
  }

  function updatePrevious(patch: Partial<(typeof state.previousSemesters)[0]>) {
    setState((prev) => ({
      ...prev,
      previousSemesters: [{ ...prev.previousSemesters[0], ...patch }],
    }));
  }

  const targetGpa = 3.0;
  const needed = useMemo(() => {
    if (cumulativeTotals.cgpa === null) return null;
    if (cumulativeTotals.cgpa >= targetGpa) return null;
    const gap = targetGpa - cumulativeTotals.cgpa;
    return roundTo(gap, 2);
  }, [cumulativeTotals.cgpa]);

  function roundTo(v: number, d: number) {
    const p = 10 ** d;
    return Math.round((v + Number.EPSILON) * p) / p;
  }

  return (
    <div className="bg-[#f4f5fa] px-4 py-6 dark:bg-slate-950 sm:px-6 md:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left: input card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="hidden grid-cols-[1fr_130px_96px_28px] gap-4 px-1 pb-3 text-xs font-medium text-slate-500 dark:text-slate-400 sm:grid">
              <span>Course (optional)</span>
              <span>Grade</span>
              <span>Credits</span>
              <span />
            </div>

            <div className="flex flex-col gap-4">
              {semester.courses.map((course, index) => (
                <div
                  key={course.id}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_130px_96px_28px] sm:gap-4"
                >
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) =>
                      updateCourse(course.id, { name: e.target.value })
                    }
                    placeholder="e.g. Statistics"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <select
                    value={course.gradeLetter}
                    onChange={(e) =>
                      updateCourse(course.id, { gradeLetter: e.target.value })
                    }
                    aria-label="Grade"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">Select</option>
                    {gradeScale.letters.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={course.credits}
                    onChange={(e) =>
                      updateCourse(course.id, { credits: e.target.value })
                    }
                    placeholder="3"
                    aria-label="Credits"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    aria-label="Remove course"
                    disabled={
                      index === semester.courses.length - 1 && !isFilled(course)
                    }
                    className="flex h-8 w-8 disabled:invisible items-center justify-center self-center justify-self-end rounded-md text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              A new row appears as soon as you fill the last one.
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                type="button"
                role="switch"
                aria-checked={state.preferences.includePreviousInCgpa}
                onClick={() =>
                  toggleIncludePrevious(!state.preferences.includePreviousInCgpa)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  state.preferences.includePreviousInCgpa
                    ? "bg-[#565add]"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    state.preferences.includePreviousInCgpa
                      ? "translate-x-[20px]"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <div className="text-sm">
                <span className="font-medium text-slate-900 dark:text-white">
                  Include previous GPA
                </span>{" "}
                <span className="text-slate-400 dark:text-slate-500">
                  for your cumulative GPA
                </span>
              </div>
            </div>

            {state.preferences.includePreviousInCgpa ? (
              <div className="mt-5 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Current GPA
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={previousRow.gpa}
                    onChange={(e) => updatePrevious({ gpa: e.target.value })}
                    placeholder="2.85"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Credits completed
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={previousRow.credits}
                    onChange={(e) =>
                      updatePrevious({ credits: e.target.value })
                    }
                    placeholder="45"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              </div>
            ) : null}
          </div>

          {/* Right: result cards */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-[#0f1729] p-6 text-white shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-300">Semester GPA</div>
                  <div className="mt-1.5 text-3xl font-bold text-white">
                    {formatGpaMaybe(semesterTotals.gpa)}
                  </div>
                  <div className="mt-1.5 text-xs text-slate-400">
                    {semesterTotals.totalCredits} credits
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-300">Cumulative GPA</div>
                  <div className="mt-1.5 text-3xl font-bold text-[#ffb648]">
                    {formatGpaMaybe(cumulativeTotals.cgpa)}
                  </div>
                  <div className="mt-1.5 text-xs text-slate-400">
                    {cumulativeTotals.finalCredits} credits
                  </div>
                </div>
              </div>
              <ShowCalculation
                semesterTotals={semesterTotals}
                cumulativeTotals={cumulativeTotals}
              />
            </div>

            {needed !== null ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {needed} away from a {targetGpa.toFixed(1)}
                </div>
                <a
                  href="#calculation"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#565add] hover:underline"
                >
                  See exactly what grades you need next term
                  <FaArrowRight className="text-[11px]" aria-hidden="true" />
                </a>
              </div>
            ) : null}

            <DoneForYouCard
              placement="cgpa_calculator_card"
              title="Working full-time while taking classes?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowCalculation({
  semesterTotals,
  cumulativeTotals,
}: {
  semesterTotals: ReturnType<typeof computeSemesterTotals>;
  cumulativeTotals: ReturnType<typeof computeCumulativeTotals>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id="calculation" className="mt-3 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-[#8b8ff5] underline underline-offset-2 hover:text-white"
      >
        Show calculation
      </button>
      {open ? (
        <dl className="mt-3 space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between gap-4">
            <dt>Semester quality points</dt>
            <dd>{semesterTotals.totalQualityPoints.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Semester credits</dt>
            <dd>{semesterTotals.totalCredits}</dd>
          </div>
          {cumulativeTotals.includePrevious ? (
            <>
              <div className="flex justify-between gap-4">
                <dt>Previous quality points</dt>
                <dd>{cumulativeTotals.previousQualityPoints.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Previous credits</dt>
                <dd>{cumulativeTotals.previousCredits}</dd>
              </div>
            </>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1.5 font-medium text-white">
            <dt>Cumulative GPA</dt>
            <dd>
              {cumulativeTotals.finalQualityPoints.toFixed(2)} ÷{" "}
              {cumulativeTotals.finalCredits} = {formatGpaMaybe(cumulativeTotals.cgpa)}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
