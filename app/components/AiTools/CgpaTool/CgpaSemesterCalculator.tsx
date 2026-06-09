"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalculatorState, Semester } from "./types";
import SemesterCard from "./components/SemesterCard";
import { Button } from "./components/ui";
import { createInitialState, createSemester } from "./utils/state";
import {
  computeAllSemesterTotals,
  hasAnyCalculableCgpaInput,
} from "./utils/calc";
import { formatCgpaForEmailAndSync } from "./utils/gpaEmail";

export default function CgpaSemesterCalculator() {
  const initial = useMemo(() => createInitialState(), []);
  const [state, setState] = useState<CalculatorState>(initial);
  const [showResults, setShowResults] = useState(false);

  const semesterTotals = useMemo(
    () => computeAllSemesterTotals(state.semesters, state.gradeScale),
    [state.semesters, state.gradeScale],
  );

  function setSemester(next: Semester) {
    setShowResults(false);
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) => (s.id === next.id ? next : s)),
    }));
  }

  function addSemester() {
    setShowResults(false);
    setState((prev) => ({
      ...prev,
      semesters: [
        ...prev.semesters,
        createSemester(prev.semesters.length + 1),
      ],
    }));
  }

  function removeSemester(id: string) {
    setShowResults(false);
    setState((prev) => {
      const next = prev.semesters.filter((s) => s.id !== id);

      return {
        ...prev,
        semesters: next.length ? next : [createSemester(1)],
      };
    });
  }

  function resetAll() {
    const next = createInitialState();
    setState(next);
    setShowResults(false);
  }

  function tryShowGpaResults() {
    if (
      !hasAnyCalculableCgpaInput(state) ||
      formatCgpaForEmailAndSync(state) === "—"
    ) {
      toast.error(
        "Add at least one course with a grade and credits, or enter previous semester credits and GPA.",
      );
      return;
    }
    setShowResults(true);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Semesters
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            className="md:inline-block hidden"
            onClick={tryShowGpaResults}
          >
            Calculate GPA
          </Button>
          <Button type="button" variant="secondary" onClick={addSemester}>
            Add semester
          </Button>
          <Button type="button" variant="secondary" onClick={resetAll}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {state.semesters.map((semester) => (
          <div key={semester.id} className="space-y-2">
            <SemesterCard
              semester={semester}
              gradeScale={state.gradeScale}
              onChange={setSemester}
              onRemoveSemester={() => removeSemester(semester.id)}
              onCalculateGpa={tryShowGpaResults}
              disableRemove={state.semesters.length <= 1}
              showResults={showResults}
            />
            {(() => {
              if (!showResults) return null;
              const found = semesterTotals.find(
                (x) => x.semesterId === semester.id,
              );
              if (!found || found.totals.validCourseCount > 0) return null;

              return <></>;
            })()}
          </div>
        ))}
      </div>
    </section>
  );
}
